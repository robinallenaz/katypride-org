import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Redis } from '@upstash/redis';
import { ghlRequest, GHL_LOCATION_ID } from '@/lib/ghl';
import {
  getVendorPipeline,
  getStageIdByName,
  findOpportunityByContactAndPipeline,
  updateOpportunityStage,
} from '@/lib/ghl-pipeline';

// Kill switch: Check if Stripe payments are disabled
const stripeEnabled = process.env.STRIPE_ENABLED !== 'false';

// Initialize Redis client for idempotency tracking
const redis = Redis.fromEnv();

// Environment variable validation - lazy, not at module load
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Lazy Stripe initialization
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeEnabled) {
    throw new Error('Stripe is disabled via STRIPE_ENABLED env var');
  }
  
  if (!stripeInstance) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' as any });
  }
  
  return stripeInstance;
}

if (!upstashUrl || !upstashToken) {
  console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured. Webhook idempotency will use in-memory fallback (not suitable for production multi-instance deployments).');
}

const PROCESSED_EVENTS_MAX_SIZE = 1000;

// In-memory fallback for development
const processedEventIds = new Set<string>();
const processingEventIds = new Set<string>();

// Redis-based idempotency check
async function isEventProcessedRedis(eventId: string): Promise<boolean> {
  try {
    const exists = await redis.exists(`webhook:${eventId}`);
    return exists === 1;
  } catch (error) {
    console.error('Redis idempotency check failed, falling back to in-memory:', error);
    return processedEventIds.has(eventId);
  }
}

async function markEventProcessedRedis(eventId: string): Promise<void> {
  try {
    // Store with 24-hour expiration to prevent unbounded growth
    await redis.setex(`webhook:${eventId}`, 24 * 60 * 60, '1');
  } catch (error) {
    console.error('Redis mark processed failed, falling back to in-memory:', error);
    processedEventIds.add(eventId);
  }
}

function markEventProcessed(eventId: string): void {
  processingEventIds.delete(eventId);
  
  if (processedEventIds.size >= PROCESSED_EVENTS_MAX_SIZE) {
    const entries = Array.from(processedEventIds).slice(-Math.floor(PROCESSED_EVENTS_MAX_SIZE * 0.8));
    processedEventIds.clear();
    entries.forEach(id => processedEventIds.add(id));
  }
  processedEventIds.add(eventId);
}

function markEventProcessing(eventId: string): boolean {
  if (processingEventIds.has(eventId)) {
    return false;
  }
  if (processedEventIds.has(eventId)) {
    return false;
  }
  processingEventIds.add(eventId);
  return true;
}

function markEventFailed(eventId: string): void {
  processingEventIds.delete(eventId);
}

function isEventProcessed(eventId: string): boolean {
  return processedEventIds.has(eventId);
}

export async function POST(request: NextRequest) {
  // Check kill switch first
  if (!stripeEnabled) {
    return NextResponse.json(
      { error: 'Payment tracking is currently disabled' },
      { status: 503 }
    );
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook service not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event
  try {
    const body = await request.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check: Skip if already processed or being processed
  const isProcessed = upstashUrl && upstashToken 
    ? await isEventProcessedRedis(event.id)
    : isEventProcessed(event.id);
    
  if (isProcessed) {
    console.log(`Webhook event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true, idempotency: true })
  }
  
  // Mark as processing to prevent concurrent processing
  if (!markEventProcessing(event.id)) {
    console.log(`Webhook event ${event.id} is already being processed, skipping`)
    return NextResponse.json({ received: true, processing: true })
  }

  // Handle donation payments (PaymentIntent)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { donor_email, donor_name, donation_frequency } = paymentIntent.metadata

    if (donor_email) {
      try {
        const contactData = {
          email: donor_email,
          name: donor_name || '',
          locationId: GHL_LOCATION_ID,
          tags: ['donor'],
          customFields: {
            last_payment_intent_id: paymentIntent.id,
            last_payment_status: 'succeeded',
            last_donation_amount: paymentIntent.amount / 100,
            last_payment_method: paymentIntent.payment_method_types?.[0] || '',
            donation_frequency: donation_frequency || '',
          },
        }

        // Lookup existing contact by email to avoid duplicates on webhook retries
        let existingContactId: string | null = null
        try {
          const lookup = await ghlRequest(
            `/contacts/lookup?email=${encodeURIComponent(donor_email)}`
          )
          existingContactId = lookup?.contacts?.[0]?.id || null
        } catch {
          // Contact not found — will create a new one below
        }

        if (existingContactId) {
          await ghlRequest(`/contacts/${existingContactId}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
          })
        } else {
          await ghlRequest('/contacts/', {
            method: 'POST',
            body: JSON.stringify(contactData),
          })
        }
        
        // Mark as processed only after successful GHL update
        markEventProcessed(event.id)
        return NextResponse.json({ received: true })
      } catch (ghlError) {
        // Mark as failed so retries can attempt it again
        markEventFailed(event.id)
        console.error('Failed to update GHL contact after donation payment:', ghlError)
        return NextResponse.json(
          { error: 'Failed to process donation in CRM', received: false },
          { status: 500 }
        )
      }
    } else {
      // No donor_email - mark as processed to prevent infinite retries
      markEventProcessed(event.id)
    }
  }

  // Handle vendor and sponsor payments (Checkout Session)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { type, email, name, company, phone, _clientMetadata } = session.metadata || {}
    
    // Parse _clientMetadata to extract crmContactId and other nested metadata
    let crmContactId: string | undefined
    if (_clientMetadata) {
      try {
        const clientMetadata = JSON.parse(_clientMetadata)
        crmContactId = clientMetadata.crmContactId
      } catch {
        // Invalid JSON, ignore
      }
    }

    if (email && type) {
      try {
        const isVendor = type === 'vendor'
        const isSponsor = type === 'sponsor'
        
        if (!isVendor && !isSponsor) {
          // Not a vendor/sponsor payment, skip but mark as processed
          markEventProcessed(event.id)
          return NextResponse.json({ received: true })
        }

        const amount = (session.amount_total || 0) / 100 // Convert from cents
        
        const contactData: any = {
          email,
          name: name || '',
          locationId: GHL_LOCATION_ID,
          tags: isVendor ? ['vendor', 'paid'] : ['sponsor', 'paid'],
          customFields: {
            stripe_session_id: session.id,
            payment_status: 'paid',
            payment_amount: amount,
            payment_date: new Date().toISOString(),
            ...(isVendor && { vendor_type: session.metadata?.vendorType || '' }),
            ...(isSponsor && { sponsorship_level: session.metadata?.sponsorshipLevel || '' }),
          },
        }

        // Add phone if available
        if (phone) {
          contactData.phone = phone
        }

        // Add company name if available
        if (company) {
          contactData.companyName = company
        }

        // Determine the contact ID to update (and later find the pipeline opp)
        let finalContactId: string | null = crmContactId || null;

        // If we have a CRM contact ID from the metadata, update that contact
        if (finalContactId) {
          try {
            await ghlRequest(`/contacts/${finalContactId}`, {
              method: 'PUT',
              body: JSON.stringify(contactData),
            })
            console.log(`Updated ${type} contact ${finalContactId} with payment info`)
          } catch (updateError) {
            markEventFailed(event.id)
            console.error(`Failed to update ${type} contact:`, updateError)
            // Return 500 to trigger Stripe retry - don't fall back to create duplicate
            return NextResponse.json(
              { error: 'Failed to update existing contact', received: false },
              { status: 500 }
            )
          }
        } else {
          // Lookup existing contact by email
          try {
            const lookup = await ghlRequest(
              `/contacts/lookup?email=${encodeURIComponent(email)}`
            )
            finalContactId = lookup?.contacts?.[0]?.id || null
          } catch {
            // Contact not found — will create a new one below
          }

          try {
            if (finalContactId) {
              await ghlRequest(`/contacts/${finalContactId}`, {
                method: 'PUT',
                body: JSON.stringify(contactData),
              })
            } else {
              const newContact = await ghlRequest('/contacts/', {
                method: 'POST',
                body: JSON.stringify(contactData),
              })
              finalContactId = newContact?.contact?.id || null
            }
          } catch (ghlError) {
            markEventFailed(event.id)
            console.error(`Failed to create/update ${type} contact:`, ghlError)
            return NextResponse.json(
              { error: 'Failed to process payment in CRM', received: false },
              { status: 500 }
            )
          }
        }

        // Log successful payment processing
        console.log(`Processed ${type} payment: ${session.id} for ${email}, amount: $${amount}`)

        // Use the same contact ID for the pipeline opportunity update
        const paymentContactId = finalContactId;

        // Move the associated pipeline opportunity to "Application Paid" stage
        if (paymentContactId) {
          try {
            const pipeline = await getVendorPipeline();
            if (pipeline) {
              const appPaidStageId = getStageIdByName(pipeline, 'Paid');
              if (appPaidStageId) {
                const opp = await findOpportunityByContactAndPipeline(
                  paymentContactId,
                  pipeline.id
                );
                if (opp && opp.stageId !== appPaidStageId) {
                  const updated = await updateOpportunityStage(opp.id, appPaidStageId);
                  if (updated) {
                    console.log(
                      `[Pipeline] Moved opportunity ${opp.id} to Paid for contact ${paymentContactId}`
                    );
                  }
                } else if (!opp) {
                  console.warn(
                    `[Pipeline] No opportunity found for contact ${paymentContactId} in pipeline ${pipeline.id}`
                  );
                }
              } else {
                console.warn('[Pipeline] Paid stage not found');
              }
            }
          } catch (pipelineError) {
            console.error('[Pipeline] Failed to update opportunity stage:', pipelineError);
            // Non-fatal — payment was already recorded in CRM
          }
        }
      } catch (outerError) {
        markEventFailed(event.id)
        console.error(`Failed to update GHL contact after ${type} payment:`, outerError)
        return NextResponse.json(
          { error: 'Failed to process payment in CRM', received: false },
          { status: 500 }
        )
      }
      // Mark as processed only after successful GHL update
      markEventProcessed(event.id)
    } else {
      // Missing email or type - log warning and mark processed to prevent infinite retries
      console.warn(`Checkout session ${session.id} missing email or type in metadata, skipping CRM update`)
      markEventProcessed(event.id)
    }
  }

  return NextResponse.json({ received: true })
}

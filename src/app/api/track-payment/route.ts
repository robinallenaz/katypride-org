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
import { submitGhlForm } from '@/lib/ghl-forms';

// GHL form ID for the "2025 Vendor Form" — workflow 1a triggers on
// submissions to this form and handles opportunity creation, agreement
// send, and stage progression. Set in Vercel env.
const GHL_VENDOR_FORM_ID = process.env.GHL_VENDOR_FORM_ID || 'ANHnhavGydDuPa4wvvSq';

// GHL form ID for the "Sponsorship Form" — workflow 1b is currently a
// draft, so even when set this only logs/records the submission. Safe
// to leave unset until 1b is built out.
const GHL_SPONSOR_FORM_ID = process.env.GHL_SPONSOR_FORM_ID || '';

// Kill switch: Check if Stripe payments are disabled
const stripeEnabled = process.env.STRIPE_ENABLED !== 'false';

// Environment variable validation - lazy, not at module load
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Lazy Redis initialization — don't crash the module if env vars are missing.
let redisInstance: ReturnType<typeof Redis.fromEnv> | null = null;
function getRedis() {
  if (!redisInstance) {
    redisInstance = Redis.fromEnv();
  }
  return redisInstance;
}

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
    const redis = getRedis();
    const exists = await redis.exists(`webhook:${eventId}`);
    return exists === 1;
  } catch (error) {
    console.error('Redis idempotency check failed, falling back to in-memory:', error);
    return processedEventIds.has(eventId);
  }
}

async function markEventProcessedRedis(eventId: string): Promise<void> {
  try {
    const redis = getRedis();
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

function isEventProcessed(eventId: string): boolean {
  return processedEventIds.has(eventId);
}

export async function POST(request: NextRequest) {
  try {
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

  // Handle PaymentIntent (donations AND vendor/sponsor payments).
  // The website's vendor/sponsor flow uses PaymentIntent + CardElement,
  // NOT Stripe Checkout — so vendor/sponsor logic must live here.
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const metadata = paymentIntent.metadata || {}
    const paymentType = metadata.type
    const email = metadata.donor_email
    const name = metadata.donor_name
    const donation_frequency = metadata.donation_frequency

    if (!email) {
      // Nothing actionable — mark processed to prevent retries
      markEventProcessed(event.id)
      return NextResponse.json({ received: true })
    }

    // ===== Vendor / Sponsor branch =====
    if (paymentType === 'vendor' || paymentType === 'sponsor') {
      const isVendor = paymentType === 'vendor'
      const amount = paymentIntent.amount / 100
      const crmContactId = metadata.crmContactId || ''
      const company = metadata.company || ''

      const contactData: any = {
        email,
        name: name || '',
        locationId: GHL_LOCATION_ID,
        tags: isVendor ? ['vendor', 'paid'] : ['sponsor', 'paid'],
        customFields: {
          stripe_payment_intent_id: paymentIntent.id,
          payment_status: 'paid',
          payment_amount: amount,
          payment_date: new Date().toISOString(),
          last_payment_method: paymentIntent.payment_method_types?.[0] || '',
          ...(isVendor && { vendor_type: metadata.vendorType || '' }),
          ...(metadata.promoCode && { promo_code: metadata.promoCode }),
        },
      }
      if (company) {
        contactData.companyName = company
      }

      let finalContactId: string | null = crmContactId || null

      // Update existing contact (most common — CRM created it before payment)
      try {
        if (finalContactId) {
          await ghlRequest(`/contacts/${finalContactId}`, {
            method: 'PUT',
            body: JSON.stringify(contactData),
          })
          console.log(`[Webhook] Updated ${paymentType} contact ${finalContactId} (PI ${paymentIntent.id})`)
        } else {
          // Fallback: lookup by email, then update or create
          try {
            const lookup = await ghlRequest(
              `/contacts/lookup?email=${encodeURIComponent(email)}`
            )
            finalContactId = lookup?.contacts?.[0]?.id || null
          } catch {
            // Contact not found — create new
          }

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
        }
      } catch (ghlError) {
        // Non-fatal: return 200 so Stripe stops retrying. Log the error for
        // manual reconciliation. Re-enabling the webhook without this fix
        // caused Stripe to disable the endpoint after 9 days of 500 retries.
        markEventProcessed(event.id)
        console.error(`[Webhook] GHL contact update failed for ${paymentType} payment (PI ${paymentIntent.id}):`, ghlError)
        return NextResponse.json(
          { received: true, warning: 'GHL contact update failed, logged for manual reconciliation' }
        )
      }

      // Pipeline strategy for vendor vs. sponsor:
      //
      //   VENDOR: do NOT move the opp directly. Submit to the GHL
      //   "2025 Vendor Form" via API. That fires workflow 1a, which
      //   creates the opportunity in Paid stage, sends the Vendor
      //   Agreement, and advances to Contract Sent. This keeps the
      //   GHL-side automation as the single source of truth.
      //
      //   SPONSOR: workflow 1b is empty, so we still need to move the
      //   opp directly. Kristina handles agreement send manually until
      //   1b is built.
      if (isVendor) {
        if (GHL_VENDOR_FORM_ID) {
          try {
            // Field names MUST match the GHL "2025 Vendor Form" query keys
            // exactly. Verified field map (2026-05-12):
            //   first_name, last_name, email, phone, organization,
            //   vendor_type, products/services/menu_sold, address, city,
            //   state, postal_code, website, business_social_media_handle(s),
            //   terms_and_conditions
            //
            // We only send fields we have from Stripe metadata; missing fields
            // are stripped by submitGhlForm. The contact already exists in GHL
            // (created by /api/crm), so the form submission updates the contact
            // and triggers workflow 1a.
            const vendorTypeMap: Record<string, string> = {
              nonprofit: 'Non-Profit - $225',
              forprofit: 'For-Profit - $275',
              food: 'Food Vendor - $300',
              political: 'Political Campaign - $275',
              government: 'Government Entity - $275',
            };

            const formResult = await submitGhlForm(
              GHL_VENDOR_FORM_ID,
              {
                first_name: (name || '').split(' ')[0] || '',
                last_name: (name || '').split(' ').slice(1).join(' ') || '',
                email,
                // Stripe SDK types removed `charges`; runtime still exposes it via latest_charge expansion.
                phone:
                  (paymentIntent as any).charges?.data?.[0]?.billing_details
                    ?.phone || '',
                organization: company || '',
                vendor_type:
                  vendorTypeMap[metadata.vendorType || ''] ||
                  metadata.vendorType ||
                  '',
              },
              GHL_LOCATION_ID
            );
            if (formResult.ok) {
              console.log(
                `[GHL Form] Submitted vendor form for ${email} (PI ${paymentIntent.id}) — workflow 1a should fire`
              );
            } else {
              console.error(
                `[GHL Form] Vendor form submit failed (${formResult.status}): ${formResult.error}`,
                formResult.body
              );
            }
          } catch (formError) {
            // Non-fatal — payment + contact are recorded; agreement can be
            // sent manually from GHL if this fails.
            console.error('[GHL Form] Vendor form submission threw:', formError);
          }
        } else {
          console.warn(
            '[GHL Form] GHL_VENDOR_FORM_ID not set — workflow 1a will not fire automatically. Vendor agreement must be sent manually.'
          );
        }
      } else {
        // Sponsor branch: move opp directly since workflow 1b is empty
        if (finalContactId) {
          try {
            const pipeline = await getVendorPipeline();
            if (pipeline) {
              const paidStageId = getStageIdByName(pipeline, 'Paid');
              if (paidStageId) {
                const opp = await findOpportunityByContactAndPipeline(
                  finalContactId,
                  pipeline.id
                );
                if (opp && opp.stageId !== paidStageId) {
                  const updated = await updateOpportunityStage(opp.id, paidStageId);
                  if (updated) {
                    console.log(
                      `[Pipeline] Moved sponsor opportunity ${opp.id} to Paid for ${email}`
                    );
                  }
                } else if (!opp) {
                  console.warn(
                    `[Pipeline] No sponsor opportunity found for contact ${finalContactId} — payment recorded but stage not moved`
                  );
                }
              } else {
                console.warn('[Pipeline] "Paid" stage not found in vendor pipeline');
              }
            } else {
              console.warn('[Pipeline] Vendor pipeline not configured (set GHL_VENDOR_PIPELINE_ID)');
            }
          } catch (pipelineError) {
            console.error('[Pipeline] Failed to update sponsor opportunity stage:', pipelineError);
          }
        }
      }

      markEventProcessed(event.id)
      return NextResponse.json({ received: true })
    }

    // ===== Donation branch (default) =====
    const contactData = {
      email,
      name: name || '',
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
        `/contacts/lookup?email=${encodeURIComponent(email)}`
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

    markEventProcessed(event.id)
    return NextResponse.json({ received: true })
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
            // Non-fatal: return 200 so Stripe stops retrying.
            markEventProcessed(event.id)
            console.error(`[Webhook] GHL contact update failed for ${type} payment (session ${session.id}):`, updateError)
            return NextResponse.json(
              { received: true, warning: 'GHL contact update failed, logged for manual reconciliation' }
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
            // Non-fatal: return 200 so Stripe stops retrying.
            markEventProcessed(event.id)
            console.error(`[Webhook] GHL contact create/update failed for ${type} payment (session ${session.id}):`, ghlError)
            return NextResponse.json(
              { received: true, warning: 'GHL contact create/update failed, logged for manual reconciliation' }
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
        // Non-fatal: return 200 so Stripe stops retrying.
        markEventProcessed(event.id)
        console.error(`[Webhook] GHL contact processing failed for ${type} payment (session ${session.id}):`, outerError)
        return NextResponse.json(
          { received: true, warning: 'GHL contact processing failed, logged for manual reconciliation' }
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
  } catch (unexpectedError) {
    // Absolute safety net: Stripe will keep retrying if we throw or return
    // anything outside 200-299. Log the error and return 200 so retries stop.
    console.error('[Webhook] Unexpected error in track-payment handler:', unexpectedError);
    return NextResponse.json({ received: true, warning: 'Handler error swallowed to prevent Stripe retry loop' });
  }
}

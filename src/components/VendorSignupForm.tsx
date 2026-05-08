'use client';

import React, { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;
let lastPublishableKey: string | null = null;

function getStripe(): Promise<Stripe | null> | null {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  // Reset promise if key changes or was previously null
  if (stripePromise === null || publishableKey !== lastPublishableKey) {
    lastPublishableKey = publishableKey || null;
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return phoneRegex.test(phone) && cleanPhone.length === 10;
};

const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const vendorTypes = [
  { value: 'nonprofit', label: 'Non-Profit', price: 225, loyaltyEligible: true },
  { value: 'forprofit', label: 'For-Profit', price: 275, loyaltyEligible: true },
  { value: 'food', label: 'Food Vendor', price: 300, loyaltyEligible: false },
  { value: 'political', label: 'Political Campaign', price: 275, loyaltyEligible: false },
  { value: 'government', label: 'Government Entity', price: 275, loyaltyEligible: false },
];

// LOYAL50 returning-vendor discount: $50 off, valid May 1-31, 2026.
// Not eligible for government, political, or food vendors.
const LOYALTY_CODE = 'LOYAL50';
const LOYALTY_DISCOUNT = 50;
const LOYALTY_START = new Date('2026-05-01T00:00:00-05:00');
const LOYALTY_END = new Date('2026-06-01T00:00:00-05:00');

// TEST1: internal/test code — 99% off any vendor type, no time window.
const TEST_CODE = 'TEST1';
const TEST_PERCENT = 0.99;

function isLoyaltyWindowActive(now: Date = new Date()): boolean {
  return now >= LOYALTY_START && now < LOYALTY_END;
}

// Public kill switch: when NEXT_PUBLIC_STRIPE_ENABLED === 'false', the form
// skips Stripe entirely and submits as an invoice-request lead instead.
// Pair with STRIPE_ENABLED=false on the server (api/create-payment-intent).
const STRIPE_DISABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'false';

export default function VendorSignupFormWrapper() {
  // Invoice-only mode: render the form without Stripe Elements so a bad/
  // missing publishable key cannot break the page.
  if (STRIPE_DISABLED) {
    return <VendorSignupForm />;
  }

  const stripe = getStripe();

  if (!stripe) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 rounded-lg text-red-700">
        Payment system is not configured. Please contact support.
      </div>
    );
  }

  return (
    <Elements stripe={stripe}>
      <VendorSignupForm />
    </Elements>
  );
}

function VendorSignupForm() {
  const stripe = !STRIPE_DISABLED ? useStripe() : null;
  const elements = !STRIPE_DISABLED ? useElements() : null;
  const [formData, setFormData] = useState({
    company: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    website: '',
    socialMedia: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vendorType: '',
    productsServices: '',
    agreeToTexts: false,
    promoCode: '',
  });
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.vendorType) newErrors.vendorType = 'Vendor type is required';
    if (!formData.productsServices.trim()) newErrors.productsServices = 'Products/services description is required';
    
    // Email validation
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid US phone number';
    }

    // Website validation (optional)
    if (formData.website && !isValidURL(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    // Postal code validation (US format)
    if (formData.postalCode) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.postalCode)) {
        newErrors.postalCode = 'Please enter a valid ZIP code (e.g., 77084 or 77084-1234)';
      }
    }

    // State validation (2-letter US state code)
    if (formData.state) {
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(formData.state.toUpperCase())) {
        newErrors.state = 'Please enter a valid 2-letter state code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // If the vendor type changed and the applied LOYAL50 discount is no
    // longer eligible, remove it. TEST1 applies to all vendor types so we
    // re-compute its amount instead of dropping it.
    if (name === 'vendorType' && appliedDiscount) {
      const newType = vendorTypes.find(v => v.value === value);
      if (appliedDiscount.code === LOYALTY_CODE) {
        if (!newType || !newType.loyaltyEligible) {
          setAppliedDiscount(null);
          setPromoMessage({
            type: 'error',
            text: 'LOYAL50 is not eligible for government, political, or food vendors.',
          });
        }
      } else if (appliedDiscount.code === TEST_CODE && newType) {
        const newAmount = Math.round(newType.price * TEST_PERCENT);
        setAppliedDiscount({ code: TEST_CODE, amount: newAmount });
      }
    }

    // Clear promo status when user edits the promo code field
    if (name === 'promoCode') {
      setPromoMessage(null);
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const selectedVendorType = vendorTypes.find(v => v.value === formData.vendorType);
  const discountEligible = !!appliedDiscount && (
    appliedDiscount.code === TEST_CODE ||
    (appliedDiscount.code === LOYALTY_CODE && !!selectedVendorType?.loyaltyEligible)
  );
  const discountAmount = discountEligible ? appliedDiscount!.amount : 0;
  const finalPrice = Math.max(0, (selectedVendorType?.price || 0) - discountAmount);

  const handleApplyPromo = () => {
    const code = formData.promoCode.trim().toUpperCase();
    if (!code) {
      setPromoMessage({ type: 'error', text: 'Please enter a promo code.' });
      return;
    }
    if (code === LOYALTY_CODE) {
      if (!isLoyaltyWindowActive()) {
        setPromoMessage({ type: 'error', text: 'This code is only valid May 1–31, 2026.' });
        setAppliedDiscount(null);
        return;
      }
      if (selectedVendorType && !selectedVendorType.loyaltyEligible) {
        setPromoMessage({
          type: 'error',
          text: 'LOYAL50 is not eligible for government, political, or food vendors.',
        });
        setAppliedDiscount(null);
        return;
      }
      setAppliedDiscount({ code: LOYALTY_CODE, amount: LOYALTY_DISCOUNT });
      setPromoMessage({
        type: 'success',
        text: `LOYAL50 applied! $${LOYALTY_DISCOUNT} returning-vendor discount.`,
      });
      return;
    }
    if (code === TEST_CODE) {
      if (!selectedVendorType) {
        setPromoMessage({ type: 'error', text: 'Please select a vendor type before applying a promo code.' });
        return;
      }
      const amount = Math.round(selectedVendorType.price * TEST_PERCENT);
      setAppliedDiscount({ code: TEST_CODE, amount });
      setPromoMessage({
        type: 'success',
        text: `TEST1 applied! 99% off ($${amount} discount).`,
      });
      return;
    }
    setPromoMessage({ type: 'error', text: 'Invalid promo code.' });
    setAppliedDiscount(null);
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setPromoMessage(null);
    setFormData(prev => ({ ...prev, promoCode: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // In invoice-only mode (Stripe disabled), Stripe hooks return null and
    // we skip card collection / payment intent entirely.
    if (!STRIPE_DISABLED && (!stripe || !elements)) {
      setSubmitMessage('Payment system is not ready. Please try again.');
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      setSubmitMessage('Please correct the errors below and try again.');
      return;
    }

    // Capture current form values to prevent race conditions
    const currentFormData = { ...formData };
    const currentVendorTypeValue = currentFormData.vendorType;
    const currentVendorType = vendorTypes.find(v => v.value === currentVendorTypeValue);

    // Check if vendor type is selected and has a price
    if (!currentVendorType || currentVendorType.price <= 0) {
      setSubmitMessage('Please select a valid vendor type.');
      return;
    }

    // Revalidate discount at submit time (guards against vendor-type changes after apply)
    let appliedDiscountAmount = 0;
    let appliedDiscountCode = '';
    if (appliedDiscount) {
      if (appliedDiscount.code === LOYALTY_CODE && currentVendorType.loyaltyEligible && isLoyaltyWindowActive()) {
        appliedDiscountAmount = appliedDiscount.amount;
        appliedDiscountCode = LOYALTY_CODE;
      } else if (appliedDiscount.code === TEST_CODE) {
        appliedDiscountAmount = Math.round(currentVendorType.price * TEST_PERCENT);
        appliedDiscountCode = TEST_CODE;
      }
    }
    const chargeAmount = Math.max(0, currentVendorType.price - appliedDiscountAmount);

    setIsSubmitting(true);
    setSubmitMessage('');

    // ====== Invoice-only mode: short-circuit Stripe path ======
    if (STRIPE_DISABLED) {
      try {
        const honeypotValue = (document.querySelector('input[name="_gotcha"]') as HTMLInputElement)?.value || '';
        const crmResponse = await fetch('/api/crm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'vendor',
            name: `${formData.firstName} ${formData.lastName}`,
            _gotcha: honeypotValue,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            website: formData.website,
            socialMedia: formData.socialMedia,
            vendorType: currentVendorTypeValue,
            vendorFee: chargeAmount,
            vendorBaseFee: currentVendorType.price,
            promoCode: appliedDiscountCode,
            discountAmount: appliedDiscountAmount,
            productsServices: formData.productsServices,
            agreeToTexts: formData.agreeToTexts,
            paymentStatus: 'invoice-requested',
            paymentMethod: 'invoice',
            event: 'katy-pride-celebration-2026',
          }),
        });
        const crmResult = await crmResponse.json();
        if (!crmResponse.ok || !crmResult.success) {
          throw new Error(crmResult.error || 'Failed to submit application');
        }
        setSubmitStatus('success');
        setSubmitMessage(
          'Thank you! Your vendor application has been received. Our team will email you an invoice within 2 business days at the address you provided.'
        );
      } catch (err) {
        setSubmitStatus('error');
        setSubmitMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again or email info@katypride.org.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ====== Stripe checkout path ======
    // Re-narrow for TypeScript: the early return above guaranteed these.
    if (!stripe || !elements) {
      setIsSubmitting(false);
      setSubmitMessage('Payment system is not ready. Please try again.');
      return;
    }

    try {
      // First, submit to CRM to capture the lead
      // Read honeypot value from form
      const honeypotValue = (document.querySelector('input[name="_gotcha"]') as HTMLInputElement)?.value || '';
      
      const crmResponse = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vendor',
          name: `${formData.firstName} ${formData.lastName}`,
          _gotcha: honeypotValue,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          website: formData.website,
          socialMedia: formData.socialMedia,
          vendorType: currentVendorTypeValue,
          vendorFee: chargeAmount,
          vendorBaseFee: currentVendorType.price,
          promoCode: appliedDiscountCode,
          discountAmount: appliedDiscountAmount,
          productsServices: formData.productsServices,
          agreeToTexts: formData.agreeToTexts,
          paymentStatus: 'pending',
          event: 'katy-pride-celebration-2026',
        }),
      });

      const crmResult = await crmResponse.json();

      if (!crmResponse.ok || !crmResult.success) {
        throw new Error(crmResult.error || 'Failed to submit application');
      }

      // Create payment intent - amount already in cents from vendorType.price * 100
      const paymentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(chargeAmount * 100),
          currency: 'usd',
          payment_method_type: 'card',
          donor_email: currentFormData.email,
          donor_name: `${currentFormData.firstName} ${currentFormData.lastName}`,
          donation_frequency: 'one-time',
          metadata: {
            type: 'vendor',
            vendorType: currentVendorTypeValue,
            company: currentFormData.company,
            crmContactId: crmResult.contactId || '',
            baseFee: String(currentVendorType.price),
            promoCode: appliedDiscountCode,
            discountAmount: String(appliedDiscountAmount),
          },
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const { paymentIntent } = await paymentResponse.json();

      // Confirm payment with card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card information is required');
      }

      let confirmedPayment;
      try {
        const { error, paymentIntent: confirmed } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${currentFormData.firstName} ${currentFormData.lastName}`,
                email: currentFormData.email,
                address: {
                  line1: currentFormData.address,
                  city: currentFormData.city,
                  state: currentFormData.state,
                  postal_code: currentFormData.postalCode,
                },
              },
            },
          }
        );

        if (error) {
          throw new Error(error.message || 'Payment failed');
        }
        confirmedPayment = confirmed;
      } catch (paymentError) {
        // Update CRM with failed status before propagating error
        try {
          await fetch('/api/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'vendor',
              email: currentFormData.email,
              paymentStatus: 'failed',
              paymentIntentId: paymentIntent.id,
              paymentError: paymentError instanceof Error ? paymentError.message : 'Payment failed',
            }),
          });
        } catch (crmError) {
          console.warn('Failed to update CRM with payment failure:', crmError);
        }
        throw paymentError;
      }

      // Handle 3D Secure or other actions required
      // Stripe.js automatically handles the modal and resolves after authentication
      // If status is still requires_action, authentication was not completed
      if (confirmedPayment.status === 'requires_action') {
        // Update CRM with failed status
        try {
          await fetch('/api/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'vendor',
              email: currentFormData.email,
              paymentStatus: 'failed',
              paymentIntentId: confirmedPayment.id,
              paymentError: '3D Secure authentication incomplete',
            }),
          });
        } catch (crmError) {
          console.warn('Failed to update CRM with payment failure:', crmError);
        }
        throw new Error('Payment authentication incomplete. Please complete the verification or use a different card.');
      }

      if (confirmedPayment.status === 'succeeded') {
        // Update CRM with payment status (non-blocking - don't fail if CRM update fails)
        try {
          const crmUpdateResponse = await fetch('/api/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'vendor',
              email: currentFormData.email,
              paymentStatus: 'paid',
              paymentIntentId: confirmedPayment.id,
            }),
          });
          
          if (!crmUpdateResponse.ok) {
            console.warn('Failed to update CRM with payment status:', await crmUpdateResponse.text());
          }
        } catch (crmError) {
          console.warn('CRM update failed after payment:', crmError);
        }

        // Redirect to success page
        window.location.href = `/vendor-success?payment_intent=${confirmedPayment.id}`;
      } else {
        throw new Error('Payment was not completed');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Sponsor cross-link */}
      <div className="bg-purple-50 border-l-4 border-purple-400 rounded-r-lg p-4 mb-6 text-sm text-gray-700">
        Looking for <strong>brand visibility, naming opportunities, or premium placement</strong>?
        Consider a{' '}
        <a href="/sponsor-celebration" className="text-[#760088] font-semibold underline hover:text-[#5a0666]">
          Celebration sponsorship
        </a>{' '}
        instead ($250–$10,000).
      </div>

      {/* Event Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg mb-8 overflow-hidden">
        {/* Header - Always Visible */}
        <button
          type="button"
          onClick={() => setIsRequirementsOpen(!isRequirementsOpen)}
          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset"
          aria-expanded={isRequirementsOpen}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-yellow-900">Event Specifics &amp; Vendor Requirements</h3>
              <p className="text-xs sm:text-sm text-yellow-800 mt-1">These will require your acknowledgement in your vendor agreement.</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 text-yellow-700 transform transition-transform duration-200 ${
              isRequirementsOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Collapsible Content */}
        <div
          className={`transition-all duration-200 ease-in-out ${
            isRequirementsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="px-4 sm:px-6 pb-4">
            <ul className="text-xs sm:text-sm text-yellow-800 space-y-1 sm:space-y-2">
              <li>• All vendor booth spaces are <strong>10x10</strong> (Platinum sponsors receive <strong>10x20</strong> booth space).</li>
              <li>• Katy Pride will <strong>NOT</strong> provide any tents, tables, or chairs — vendors are required to bring their own.</li>
              <li>• Tents are not required, but permitted. The event is being held in an open-air, covered, packed-dirt arena.</li>
              <li>• All vendors bringing tents are <strong>required to bring tent weights</strong>. Failure to do so will result in a <strong>$100 tent weight fee</strong>.</li>
              <li>• All vendors and exhibitors must keep their booths open and <strong>stay for the entire event</strong>.</li>
              <li>• The site will open for sponsors and vendors to set up by <strong>7:00 AM</strong>. Additional information will be sent with your designated load-in time.</li>
              <li>• Katy Pride will <strong>not be providing electricity</strong> to booths. If you need electricity, please plan on bringing your own generator and inform the organizers to ensure your placement is conducive for hook-up, sound, etc.</li>
              <li>• Vendors and sponsors can bring personal snacks &amp; non-alcoholic beverages for personal consumption only. Coolers are subject to inspection.</li>
              <li>• Katy Pride is welcome to <strong>all ages</strong> and will be a <strong>family-friendly</strong> event.</li>
              <li>• Katy Pride will have <strong>security on-site</strong> and in the designated parking lot.</li>
              <li>• Katy Pride 2026 will happen <strong>rain or shine</strong>.</li>
              <li>• Katy Pride Vendor and Sponsorship fees are <strong>non-refundable and non-transferrable</strong>.</li>
              <li>• If protestors are on-site, please <strong>do not engage with them</strong>.</li>
            </ul>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 italic">
        Space is limited — We want to do our part to make sure vendors have the most success possible at our 2026 Katy Pride Celebration.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot — hidden from real users, bots auto-fill it */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" suppressHydrationWarning={true} />

        {/* Company/Organization */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company/Organization <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            placeholder="Organization"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.company ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Address"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="city" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="City"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm placeholder:text-gray-700 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-600">{errors.city}</p>
            )}
          </div>
          <div>
            <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              placeholder="State"
              maxLength={2}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm uppercase placeholder:text-gray-700 ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.state && (
              <p className="mt-1 text-xs text-red-600">{errors.state}</p>
            )}
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              required
              placeholder="Postal Code"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm placeholder:text-gray-700 ${
                errors.postalCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
            )}
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://example.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.website ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website}</p>
          )}
        </div>

        {/* Social Media */}
        <div>
          <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-1">
            Business Social Media Handle(s)
          </label>
          <input
            type="text"
            id="socialMedia"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleChange}
            placeholder="@yourhandle"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700"
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="First Name"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm placeholder:text-gray-700 ${
                errors.firstName ? 'border-red-500' : ''
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Last Name"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm placeholder:text-gray-700 ${
                errors.lastName ? 'border-red-500' : ''
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="(555) 123-4567"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Vendor Type */}
        <div>
          <label htmlFor="vendorType" className="block text-sm font-medium text-gray-700 mb-1">
            Vendor Type <span className="text-red-500">*</span>
          </label>
          <select
            id="vendorType"
            name="vendorType"
            value={formData.vendorType}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
              errors.vendorType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select vendor type...</option>
            {vendorTypes.map(vt => (
              <option key={vt.value} value={vt.value}>
                {vt.label} - ${vt.price}
              </option>
            ))}
          </select>
          {errors.vendorType && (
            <p className="mt-1 text-sm text-red-600">{errors.vendorType}</p>
          )}
          {selectedVendorType && (
            <div className="mt-2 text-sm text-purple-700 font-medium space-y-0.5">
              <p>
                Vendor Fee: ${selectedVendorType.price}
                {discountAmount > 0 && (
                  <span className="text-gray-500 line-through ml-2">${selectedVendorType.price}</span>
                )}
              </p>
              {discountAmount > 0 && (
                <>
                  <p className="text-green-700">
                    {appliedDiscount?.code} discount: −${discountAmount}
                  </p>
                  <p className="text-purple-800 font-semibold">Total: ${finalPrice}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Promo Code */}
        <div>
          <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-1">
            Promo Code
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="promoCode"
              name="promoCode"
              value={formData.promoCode}
              onChange={handleChange}
              placeholder="Enter promo code"
              disabled={!!appliedDiscount}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 uppercase disabled:bg-gray-100"
            />
            {appliedDiscount ? (
              <button
                type="button"
                onClick={handleRemovePromo}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
              >
                Apply
              </button>
            )}
          </div>
          {promoMessage && (
            <p className={`mt-1 text-sm ${promoMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
              {promoMessage.text}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Returning vendors: check your renewal email for a promo code.
            Not eligible for government, political, or food vendors.
          </p>
        </div>

        {/* Payment Information — only shown once a vendor type is chosen so
            the fee and Stripe card input are meaningful. In invoice-only
            mode (STRIPE_DISABLED) we show an invoice notice instead. */}
        {!selectedVendorType ? (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
            Select a vendor type above to see the fee
            {STRIPE_DISABLED ? '.' : ' and enter payment details.'}
          </div>
        ) : STRIPE_DISABLED ? (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Payment by Invoice</h4>
            <p className="text-sm text-blue-900">
              Online card payments are temporarily unavailable. Submit your application below
              and we&apos;ll email you an invoice for <strong>${finalPrice}.00</strong>
              {discountAmount > 0 ? ` (${appliedDiscount?.code} applied, $${discountAmount} off)` : ''}{' '}
              within 2 business days. You&apos;ll be able to pay by card, check, or bank transfer.
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Information <span className="text-red-500">*</span>
            </label>
            <div className="p-4 border border-gray-300 rounded-lg bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1a1a1a',
                        '::placeholder': {
                          color: '#374151',
                        },
                      },
                      invalid: {
                        color: '#dc2626',
                      },
                    },
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your card will be charged ${finalPrice}.00 for the vendor fee
                {discountAmount > 0 ? ` (${appliedDiscount?.code} applied, $${discountAmount} off)` : ''}.
              </p>
              <p className="text-xs text-gray-500">
                Your card information is securely processed by Stripe.
              </p>
            </div>
          </div>
        )}

        {/* Products/Services */}
        <div>
          <label htmlFor="productsServices" className="block text-sm font-medium text-gray-700 mb-1">
            Products/Services/Menu Sold <span className="text-red-500">*</span>
          </label>
          <textarea
            id="productsServices"
            name="productsServices"
            value={formData.productsServices}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe your products, services, or menu items"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white placeholder:text-gray-700 ${
              errors.productsServices ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.productsServices && (
            <p className="mt-1 text-sm text-red-600">{errors.productsServices}</p>
          )}
        </div>

        {/* Agree to Texts */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTexts"
            name="agreeToTexts"
            checked={formData.agreeToTexts}
            onChange={handleChange}
            required
            className="mt-1 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="agreeToTexts" className="text-sm text-gray-700">
            By providing my phone number, I agree to receive texts from Katy Pride. Furthermore, I understand that a contract will be sent after paying. The contract must be signed. <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isSubmitting
              ? 'Submitting...'
              : STRIPE_DISABLED
              ? 'Submit Application & Request Invoice'
              : 'Submit Vendor Application'}
          </button>

          {submitMessage && (
            <div className={`mt-4 p-4 rounded-md text-sm w-full ${
              submitStatus === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {submitMessage}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

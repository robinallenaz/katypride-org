'use client';

import React, { useState } from 'react';
import { Check, Users, Trophy, Star, Heart } from 'lucide-react';

interface SponsorFormData {
  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  
  // Organization Information
  organizationName: string;
  organizationType: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Sponsorship Details
  sponsorshipLevel: string;
  customSponsorshipAmount: string;
  additionalComments: string;
  
  // Agreement
  agreeToTerms: boolean;
  agreeToPayment: boolean;
  wantInvoice: boolean;
}

const SPONSORSHIP_LEVELS = [
  {
    id: 'water-station',
    name: 'Water Station Sponsor',
    price: 'FREE',
    description: 'Perfect for small businesses and individuals',
    features: ['Name listed on event website', 'Medium logo on race shirts', 'Option for promotional items']
  },
  {
    id: 'community',
    name: 'Community Sponsor',
    price: '$100',
    description: 'Great for local businesses and organizations',
    features: ['Name listed on event website', 'Recognition on event signage', '1 complimentary race entry', 'Option for flyers/coupons in race bags']
  },
  {
    id: 'bronze',
    name: 'Bronze Sponsor',
    price: '$250',
    description: 'Excellent visibility for growing businesses',
    features: ['Small logo on race shirts', 'Logo on social media', '2 complimentary race entries', 'Option for promotional items in race bags']
  },
  {
    id: 'color-run',
    name: 'Color Run Sponsor',
    price: '$350',
    description: 'Stand out with premium placement',
    features: ['Name listed on event website', 'Premium logo on race shirts', 'Logo on social media mentions', 'Option for promotional items in race bags']
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: '$500',
    description: 'Enhanced visibility and benefits',
    features: ['Medium logo on race shirts', 'Option for promotional items in race bags', 'Option for festival area placement', '4 complimentary race entries']
  },
  {
    id: 'kids-dash',
    name: 'Kids Dash Sponsor',
    price: '$1,000',
    description: 'Support our youth participants',
    features: ['Name listed on event website and signage', 'Large logo on race shirts', 'Logo on social media mentions', 'Booth placement at Kids Dash area']
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: '$1,000',
    description: 'Premium visibility and recognition',
    features: ['Prominent logo on race shirts and signage', 'Logo on event website and social media', '6 complimentary race entries', 'Booth space in festival area', 'Option for promotional items in race bags']
  },
  {
    id: 'presenting',
    name: 'Presenting Sponsor',
    price: '$2,500',
    description: 'Maximum visibility and recognition',
    features: ['Presented by on event materials', 'Largest logo on race shirts', 'Recognition in press releases', '10 complimentary race entries', 'Premium booth space in festival area', 'Option for promotional items in race bags']
  }
];


const ORGANIZATION_TYPES = [
  'For-Profit Business',
  'Non-Profit Organization',
  'Government Entity',
  'Educational Institution',
  'Healthcare Organization',
  'Restaurant/Food Service',
  'Retail Business',
  'Professional Services',
  'Other'
];

export default function SponsorSignupForm() {
  const [formData, setFormData] = useState<SponsorFormData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactTitle: '',
    organizationName: '',
    organizationType: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    sponsorshipLevel: '',
    customSponsorshipAmount: '',
    additionalComments: '',
    agreeToTerms: false,
    agreeToPayment: false,
    wantInvoice: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Contact Information
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid US phone number';
    }

    // Organization Information
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationType) newErrors.organizationType = 'Please select organization type';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    // State validation (2-letter US state code) - case insensitive
    if (formData.state) {
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(formData.state.toUpperCase())) {
        newErrors.state = 'Please enter a valid 2-letter state code';
      }
    }

    // Sponsorship Information
    if (!formData.sponsorshipLevel) newErrors.sponsorshipLevel = 'Please select a sponsorship level';
    if (formData.sponsorshipLevel === 'custom') {
      if (!formData.customSponsorshipAmount) {
        newErrors.customSponsorshipAmount = 'Please enter a custom sponsorship amount';
      } else {
        const parsedAmount = parseFloat(formData.customSponsorshipAmount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          newErrors.customSponsorshipAmount = 'Please enter a valid amount greater than $0';
        } else if (parsedAmount > 100000) {
          newErrors.customSponsorshipAmount = 'Amount cannot exceed $100,000';
        }
      }
    }

    // Website validation (optional but if provided, must be valid)
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (e.g., https://example.com)';
    }

    // Terms and Conditions
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    if (!formData.agreeToPayment) newErrors.agreeToPayment = 'You must agree to the payment terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // First, submit to CRM to capture the lead
      const crmRequestBody = {
        type: 'sponsor',
        name: formData.contactName,
        email: formData.contactEmail,
        phone: formData.contactPhone,
        contactTitle: formData.contactTitle,
        company: formData.organizationName,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.zipCode,
        sponsorshipLevel: formData.sponsorshipLevel,
        customSponsorshipAmount: formData.customSponsorshipAmount,
        additionalComments: formData.additionalComments,
        wantInvoice: formData.wantInvoice,
        event: 'chase-the-rainbow-5k-2026',
        paymentStatus: formData.wantInvoice ? 'invoice_requested' : 'pending',
        _gotcha: ''
      };

      const crmResponse = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmRequestBody),
      });

      const crmResult = await crmResponse.json();

      if (!crmResponse.ok || !crmResult.success) {
        throw new Error(crmResult.error || 'Failed to submit sponsorship application');
      }

      // If they want an invoice, skip Stripe and show success
      if (formData.wantInvoice) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your sponsorship interest! We will contact you soon with next steps and payment information.');
        setFormData({
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          contactTitle: '',
          organizationName: '',
          organizationType: '',
          website: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          sponsorshipLevel: '',
          customSponsorshipAmount: '',
          additionalComments: '',
          agreeToTerms: false,
          agreeToPayment: false,
          wantInvoice: false
        });
        setIsSubmitting(false);
        return;
      }

      // Otherwise, create Stripe Checkout session for immediate payment
      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sponsor',
          sponsorshipLevel: formData.sponsorshipLevel,
          customAmount: formData.customSponsorshipAmount,
          email: formData.contactEmail,
          name: formData.contactName,
          company: formData.organizationName,
          phone: formData.contactPhone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          website: formData.website,
          event: 'chase-the-rainbow-5k-2026',
          metadata: {
            contactTitle: formData.contactTitle,
            organizationType: formData.organizationType,
            additionalComments: formData.additionalComments,
            crmContactId: crmResult.contactId || '',
          },
        }),
      });

      const checkoutResult = await checkoutResponse.json();

      if (!checkoutResponse.ok || !checkoutResult.url) {
        throw new Error(checkoutResult.error || 'Failed to create payment session');
      }

      // Redirect to Stripe Checkout
      const checkoutUrl = checkoutResult.url;
      try {
        const url = new URL(checkoutUrl);
        const allowedHosts = ['checkout.stripe.com', 'pay.stripe.com'];
        if (!allowedHosts.includes(url.hostname) || url.protocol !== 'https:') {
          throw new Error('Invalid checkout domain');
        }
      } catch {
        throw new Error('Invalid checkout URL received');
      }
      window.location.href = checkoutUrl;
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage(error instanceof Error ? error.message : 'There was an error submitting your sponsorship application. Please try again or contact us directly at info@katypride.org.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SponsorFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-4">Sponsorship Application Received!</h3>
        <p className="text-green-700 mb-6">{submitMessage}</p>
        <div className="bg-green-100 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">What Happens Next?</h4>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Our sponsorship coordinator will review your application</li>
            <li>• You'll receive an email within 2 business days</li>
            <li>• We'll send payment instructions and sponsorship agreement</li>
            <li>• Once payment is confirmed, we'll start promoting your sponsorship!</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-purple-100/20">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl font-bold text-[#760088] mb-4">Become a 5K Sponsor</h2>
          <p className="text-gray-700">
            Support Katy Pride and gain visibility for your organization. 
            Fill out the form below and we'll contact you with next steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#760088]" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.contactName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Title
                </label>
                <input
                  type="text"
                  value={formData.contactTitle}
                  onChange={(e) => handleInputChange('contactTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900"
                  placeholder="Marketing Director"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-[#760088]" />
              Organization Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.organizationName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Acme Corporation"
                />
                {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Type *
                </label>
                <select
                  value={formData.organizationType}
                  onChange={(e) => handleInputChange('organizationType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.organizationType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select type...</option>
                  {ORGANIZATION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.organizationType && <p className="text-red-500 text-sm mt-1">{errors.organizationType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Want Invoice?
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="wantInvoice"
                    checked={formData.wantInvoice}
                    onChange={(e) => handleInputChange('wantInvoice', e.target.checked)}
                    className="w-4 h-4 text-[#760088] border-gray-300 rounded focus:ring-[#760088]"
                  />
                  <label htmlFor="wantInvoice" className="ml-2 text-sm text-gray-700">
                    Yes, send me an invoice for payment
                  </label>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main St"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Katy"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 uppercase ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="TX"
                    maxLength={2}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="77494"
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sponsorship Selection */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-[#760088]" />
              Sponsorship Level *
            </h3>
            <div className="space-y-3">
              {SPONSORSHIP_LEVELS.map(level => (
                <label
                  key={level.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.sponsorshipLevel === level.id
                      ? 'border-[#760088] bg-[#EEEDFE]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="sponsorshipLevel"
                      value={level.id}
                      checked={formData.sponsorshipLevel === level.id}
                      onChange={(e) => handleInputChange('sponsorshipLevel', e.target.value)}
                      className="mt-1 mr-3 text-[#760088]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-800">{level.name}</span>
                        <span className="text-lg font-bold text-[#760088]">{level.price}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {level.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="w-3 h-3 mr-2 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.sponsorshipLevel && <p className="text-red-500 text-sm mt-1">{errors.sponsorshipLevel}</p>}
          </div>

          
          {/* Additional Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Comments or Questions
            </label>
            <textarea
              value={formData.additionalComments}
              onChange={(e) => handleInputChange('additionalComments', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900"
              placeholder="Any special requirements, questions about sponsorship benefits, or custom requests..."
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-[#760088]" />
              Agreement
            </h3>
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className={`mt-1 mr-3 text-[#760088] ${
                    errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-sm text-gray-700">
                  I agree to the Katy Pride sponsorship terms and conditions. 
                  I understand that sponsorship is subject to approval and payment 
                  must be received to secure sponsorship benefits.
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.agreeToPayment}
                  onChange={(e) => handleInputChange('agreeToPayment', e.target.checked)}
                  className={`mt-1 mr-3 text-[#760088] ${
                    errors.agreeToPayment ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-sm text-gray-700">
                  I understand that sponsorship fees are non-refundable and that 
                  I will receive payment instructions within 2 business days of approval.
                </span>
              </label>
              {errors.agreeToPayment && <p className="text-red-500 text-sm mt-1">{errors.agreeToPayment}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-[#760088] px-8 py-4 font-bold text-white text-lg shadow-lg transition-all hover:bg-[#5a0666] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Sponsorship Application
                  <Trophy className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{submitMessage}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

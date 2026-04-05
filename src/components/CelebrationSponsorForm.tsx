'use client';

import React, { useState } from 'react';

interface FormData {
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  organizationName: string;
  organizationType: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  sponsorshipLevel: string;
  interestedInExclusives: string[];
  additionalComments: string;
  agreeToTerms: boolean;
  wantInvoice: boolean;
  gotcha: string; // honeypot field
}

const STANDARD_TIERS = [
  {
    id: 'friends',
    name: 'Friends of Katy Pride',
    price: '$250',
    features: [
      'Personal name on website',
      'Personal name on sponsor list (not business name)',
    ],
  },
  {
    id: 'rainbow',
    name: 'Rainbow Sponsor',
    price: '$500',
    features: [
      'Name on website',
      'Name on sponsor list',
      '10×10 booth space',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: '$1,000',
    features: [
      'Name on website',
      'Name on sponsor list',
      '10×10 booth space',
      'Recognition on social media',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: '$2,500',
    features: [
      'Logo on website',
      'Name on sponsor list',
      'Name on print materials',
      'Name on t-shirt',
      '10×10 booth with premium location',
      'Recognition on social media',
      '2 tickets to Kick-off party',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: '$5,000',
    features: [
      'Logo on website',
      'Logo on sponsor list',
      'Name on print materials',
      'Logo on t-shirt',
      '10×20 booth with premium location',
      'Featured on social media',
      '3-minute commercial at festival',
      '4 tickets to Kick-off party',
    ],
  },
  {
    id: 'title',
    name: 'Title Sponsor',
    price: '$10,000',
    features: [
      'Logo on all Celebration marketing',
      'Logo on website',
      'Logo on sponsor list',
      'Logo on print materials',
      'Prime logo on t-shirt',
      '10×20 booth with premium location',
      'Headline on social media',
      '5-minute commercial at festival',
      '8 tickets to Kick-off party',
    ],
  },
];

const EXCLUSIVE_OPPORTUNITIES = [
  { id: 'hospitality', name: 'Hospitality Sponsor', price: '$3,000', description: 'Logo\'ed banner on Volunteer Tent + 30-second commercial at festival' },
  { id: 'kid-zone', name: 'Kid Zone Sponsor', price: '$3,000', description: 'Signage throughout kids zone with logo + 30-second commercial at festival' },
  { id: 'wifi-charging', name: 'WiFi & Charging Sponsor', price: '$4,000', description: 'Signage throughout event with logo and wifi login + charging station signage' },
  { id: 't-shirt', name: 'T-Shirt Sponsor', price: '$5,000', description: 'Logo on volunteer shirts + 3-minute commercial + 6 VIP party tickets' },
  { id: 'swag-bag', name: 'Swag Bag Sponsor', price: '$5,000', description: 'Logo on volunteer shirts + 3-minute commercial + 6 VIP party tickets' },
  { id: 'entertainment', name: 'Entertainment Stage Sponsor', price: '$7,500', description: 'Entertainment Stage named after your company + logo\'ed banner on main stage + 8 VIP tickets' },
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
  'Other',
];

export default function CelebrationSponsorForm() {
  const [formData, setFormData] = useState<FormData>({
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    organizationName: '',
    organizationType: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    sponsorshipLevel: '',
    interestedInExclusives: [],
    additionalComments: '',
    agreeToTerms: false,
    wantInvoice: false,
    gotcha: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInput = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleExclusive = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interestedInExclusives: prev.interestedInExclusives.includes(id)
        ? prev.interestedInExclusives.filter(e => e !== id)
        : [...prev.interestedInExclusives, id],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.contactName.trim()) newErrors.contactName = 'Name is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) newErrors.contactEmail = 'Enter a valid email';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone is required';
    if (!formData.organizationName.trim()) newErrors.organizationName = 'Organization name is required';
    if (!formData.organizationType) newErrors.organizationType = 'Please select organization type';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.sponsorshipLevel && formData.interestedInExclusives.length === 0) {
      newErrors.sponsorshipLevel = 'Please select a sponsorship level or exclusive opportunity';
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sponsor',
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
          contactName: formData.contactName,
          contactTitle: formData.contactTitle,
          organizationName: formData.organizationName,
          organizationType: formData.organizationType,
          company: formData.organizationName,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.zipCode,
          sponsorshipLevel: formData.sponsorshipLevel,
          interestedInExclusives: formData.interestedInExclusives,
          additionalComments: formData.additionalComments,
          wantInvoice: formData.wantInvoice,
          _gotcha: formData.gotcha,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed');
      }

      setSubmitStatus('success');
      setSubmitMessage('Thank you for your interest in sponsoring the Katy Pride Celebration! We will reach out within 2 business days with next steps.');
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again or email info@katypride.org.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-heading text-2xl font-bold text-green-800 mb-3">Application Received!</h3>
        <p className="text-green-700 text-lg">{submitMessage}</p>
        <p className="text-green-600 mt-4 text-sm">Have questions? Email us at <a href="mailto:info@katypride.org" className="underline">info@katypride.org</a></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="_gotcha"
        value={formData.gotcha}
        onChange={e => handleInput('gotcha', e.target.value)}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

      {/* Contact Info */}
      <section>
        <h3 className="font-heading text-xl font-bold text-[#760088] mb-4 pb-2 border-b border-purple-100">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.contactName}
              onChange={e => handleInput('contactName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.contactName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
            <input
              type="text"
              value={formData.contactTitle}
              onChange={e => handleInput('contactTitle', e.target.value)}
              placeholder="e.g. Owner, Marketing Director"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={e => handleInput('contactEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={e => handleInput('contactPhone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
          </div>
        </div>
      </section>

      {/* Organization Info */}
      <section>
        <h3 className="font-heading text-xl font-bold text-[#760088] mb-4 pb-2 border-b border-purple-100">Organization Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={e => handleInput('organizationName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.organizationName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type <span className="text-red-500">*</span></label>
            <select
              value={formData.organizationType}
              onChange={e => handleInput('organizationType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 bg-white ${errors.organizationType ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select type...</option>
              {ORGANIZATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.organizationType && <p className="text-red-500 text-sm mt-1">{errors.organizationType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={e => handleInput('website', e.target.value)}
              placeholder="https://"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.address}
              onChange={e => handleInput('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.city}
              onChange={e => handleInput('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.state}
                onChange={e => handleInput('state', e.target.value)}
                maxLength={2}
                placeholder="TX"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={e => handleInput('zipCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900 ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Standard Sponsorship Tiers */}
      <section>
        <h3 className="font-heading text-xl font-bold text-[#760088] mb-2 pb-2 border-b border-purple-100">Sponsorship Level</h3>
        <p className="text-sm text-gray-600 mb-4">Select one standard level, or choose an exclusive opportunity below (or both).</p>
        {errors.sponsorshipLevel && <p className="text-red-500 text-sm mb-3">{errors.sponsorshipLevel}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STANDARD_TIERS.map(tier => {
            const selected = formData.sponsorshipLevel === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleInput('sponsorshipLevel', selected ? '' : tier.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-[#760088] bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-[#760088]/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-heading font-bold text-gray-900 text-sm leading-tight">{tier.name}</span>
                  {selected && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#760088] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="text-[#760088] font-bold text-lg mb-2">{tier.price}</div>
                <ul className="space-y-1">
                  {tier.features.map(f => (
                    <li key={f} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-[#760088] mt-0.5">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* Exclusive Opportunities */}
      <section>
        <h3 className="font-heading text-xl font-bold text-[#760088] mb-2 pb-2 border-b border-purple-100">Exclusive Sponsorship Opportunities</h3>
        <p className="text-sm text-gray-600 mb-4">These are named, one-of-a-kind sponsorships. Select any that interest you — our team will confirm availability.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXCLUSIVE_OPPORTUNITIES.map(opp => {
            const selected = formData.interestedInExclusives.includes(opp.id);
            return (
              <button
                key={opp.id}
                type="button"
                onClick={() => toggleExclusive(opp.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-[#ff1c25] bg-red-50'
                    : 'border-gray-200 bg-white hover:border-[#ff1c25]/40'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-heading font-bold text-gray-900 text-sm leading-tight">{opp.name}</span>
                  {selected && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#ff1c25] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="text-[#ff1c25] font-bold text-lg mb-2">{opp.price}</div>
                <p className="text-xs text-gray-600">{opp.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Additional Info */}
      <section>
        <h3 className="font-heading text-xl font-bold text-[#760088] mb-4 pb-2 border-b border-purple-100">Additional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Questions or Comments</label>
            <textarea
              value={formData.additionalComments}
              onChange={e => handleInput('additionalComments', e.target.value)}
              rows={4}
              placeholder="Any questions, special requests, or additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#760088] focus:border-transparent text-gray-900"
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.wantInvoice}
              onChange={e => handleInput('wantInvoice', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#760088] border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Please send me an invoice — I prefer to pay by check or bank transfer rather than online.
            </span>
          </label>
        </div>
      </section>

      {/* Agreement */}
      <section>
        <label className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border ${errors.agreeToTerms ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={e => handleInput('agreeToTerms', e.target.checked)}
            className="mt-0.5 w-4 h-4 text-[#760088] border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            I understand that Katy Pride Vendor and Sponsorship fees are <strong>non-refundable and non-transferable</strong>, and I agree to the event terms and conditions. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
      </section>

      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{submitMessage}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#760088] text-white py-4 px-8 rounded-full font-heading font-bold text-lg hover:bg-[#5a0666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Sponsorship Application'}
      </button>
      <p className="text-center text-sm text-gray-500">
        Our team will follow up within 2 business days to confirm your sponsorship and arrange payment.
      </p>
    </form>
  );
}

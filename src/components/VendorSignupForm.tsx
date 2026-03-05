'use client';

import React, { useState } from 'react';

const vendorTypes = [
  { value: 'nonprofit', label: 'Non-Profit', price: 225 },
  { value: 'forprofit', label: 'For-Profit', price: 275 },
  { value: 'food', label: 'Food Vendor', price: 300 },
  { value: 'political', label: 'Political Campaign', price: 275 },
  { value: 'government', label: 'Government Entity', price: 275 },
];

export default function VendorSignupForm() {
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const selectedVendorType = vendorTypes.find(v => v.value === formData.vendorType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'vendor',
          name: `${formData.firstName} ${formData.lastName}`,
          _gotcha: (document.querySelector('input[name="_gotcha"]') as HTMLInputElement)?.value || '',
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          website: formData.website,
          socialMedia: formData.socialMedia,
          vendorType: formData.vendorType,
          vendorFee: selectedVendorType?.price,
          productsServices: formData.productsServices,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitMessage('Thank you for your vendor application! A contract will be sent to your email after payment is processed. Please check your email for next steps.');
        setFormData({
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
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      setSubmitMessage(`Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Event Requirements */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-yellow-900 mb-3">Event Specifics &amp; Vendor Requirements</h3>
        <p className="text-sm text-yellow-800 mb-3">These will require your acknowledgement in your vendor agreement.</p>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• All vendor booth spaces are <strong>10x10</strong>.</li>
          <li>• Katy Pride will <strong>NOT</strong> provide any tents, tables, or chairs — vendors are required to bring their own.</li>
          <li>• Tents are not required, but permitted. The event is being held in an open-air, covered, packed-dirt arena.</li>
          <li>• All vendors bringing tents are <strong>required to bring tent weights</strong>. Failure to do so will result in a <strong>$100 tent weight fee</strong>.</li>
          <li>• All vendors and exhibitors must keep their booths open and <strong>stay for the entire event</strong>.</li>
          <li>• The site will open for sponsors and vendors to set up by <strong>7:00 AM</strong>. Additional information will be sent with your designated load-in time.</li>
          <li>• Katy Pride will <strong>not be providing electricity</strong> to booths. If you need electricity, please plan on bringing your own generator and inform the organizers.</li>
          <li>• Vendors and sponsors can bring personal snacks &amp; non-alcoholic beverages for personal consumption only. Coolers are subject to inspection.</li>
          <li>• Katy Pride is welcome to <strong>all ages</strong> and will be a <strong>family-friendly</strong> event.</li>
          <li>• Katy Pride will have <strong>security on-site</strong> and in the designated parking lot.</li>
          <li>• Katy Pride 2026 will happen <strong>rain or shine</strong>.</li>
          <li>• Katy Pride Vendor and Sponsorship fees are <strong>non-refundable and non-transferrable</strong>.</li>
        </ul>
      </div>

      <p className="text-sm text-gray-600 mb-6 italic">
        Space is limited — We want to do our part to make sure vendors have the most success possible at our 2026 Katy Pride Celebration.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot — hidden from real users, bots auto-fill it */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
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
            placeholder="Web URL goes here"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
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
            placeholder="Phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          >
            <option value="">Select vendor type...</option>
            {vendorTypes.map(vt => (
              <option key={vt.value} value={vt.value}>
                {vt.label} - ${vt.price}
              </option>
            ))}
          </select>
          {selectedVendorType && (
            <p className="mt-2 text-sm text-purple-700 font-medium">
              Vendor Fee: ${selectedVendorType.price}
            </p>
          )}
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
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
            className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vendor Application'}
          </button>

          {submitMessage && (
            <div className={`mt-4 p-4 rounded-md text-sm w-full ${
              submitMessage.includes('Error')
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

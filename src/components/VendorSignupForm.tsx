'use client';

import React, { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setSubmitMessage('Please correct the errors below and try again.');
      return;
    }
    
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
          vendor_fee: selectedVendorType?.price,
          productsservices: formData.productsServices,
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
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm uppercase ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm ${
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
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white text-sm ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
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

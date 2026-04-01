'use client';

import React, { useState, useMemo } from 'react';

interface VendorFormData {
  // Contact Information
  name: string;
  email: string;
  phone: string;
  pronouns: string;
  
  // Business Information
  company: string;
  vendorType: 'nonprofit' | 'forprofit' | 'political' | 'government' | 'food';
  website: string;
  socialMedia: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  postalCode: string;
  
  // Event Specific
  productsServices: string;
  vendorFee: string;
  sponsorshipInterest: string;
  additionalInfo: string;
  
  // Terms
  agreeToTerms: boolean;
  agreeToPhotoRelease: boolean;
  agreeToTextMessages: boolean;
  understandContract: boolean;
}

const VendorApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    phone: '',
    pronouns: '',
    company: '',
    vendorType: 'forprofit',
    website: '',
    socialMedia: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    productsServices: '',
    vendorFee: '',
    sponsorshipInterest: '',
    additionalInfo: '',
    agreeToTerms: false,
    agreeToPhotoRelease: false,
    agreeToTextMessages: false,
    understandContract: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vendorTypes = [
    { value: 'nonprofit', label: 'Non-Profit Organization', fee: '$225' },
    { value: 'forprofit', label: 'For-Profit Business', fee: '$275' },
    { value: 'political', label: 'Political Organization', fee: '$300' },
    { value: 'government', label: 'Government Entity', fee: '$300' },
    { value: 'food', label: 'Food Vendor', fee: '$300' },
  ];

  const sponsorshipLevels = [
    'Friends of Pride - $250',
    'Rainbow - $500', 
    'Silver - $1,000',
    'Gold - $2,500',
    'Platinum - $5,000',
    'Title - $10,000',
    'Entertainment Stage - $7,500',
    'Hospitality - $5,000',
    'T-Shirt - $4,000',
    'WiFi/Charging - $5,000',
    'Swag Bag - $5,000',
    'Kid Zone - $3,000',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.productsServices.trim()) newErrors.productsServices = 'Products/services description is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (US format)
    if (formData.phone) {
      const phoneRegex = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
      if (!phoneRegex.test(formData.phone) || cleanPhone.length !== 10) {
        newErrors.phone = 'Please enter a valid US phone number';
      }
    }

    // Website validation
    if (formData.website) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = 'Please enter a valid website URL (e.g., https://example.com)';
      }
    }

    // State validation (2-letter US state code)
    if (formData.state) {
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(formData.state.toUpperCase())) {
        newErrors.state = 'Please enter a valid 2-letter state code';
      }
    }

    // Postal code validation (US ZIP format)
    if (formData.postalCode) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.postalCode)) {
        newErrors.postalCode = 'Please enter a valid ZIP code (e.g., 77084 or 77084-1234)';
      }
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    if (!formData.agreeToPhotoRelease) {
      newErrors.agreeToPhotoRelease = 'You must agree to the photo release';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage('Please correct the errors below and try again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const payload = {
        type: 'vendor' as const,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pronouns: formData.pronouns,
        company: formData.company,
        vendorType: formData.vendorType,
        website: formData.website,
        socialMedia: formData.socialMedia,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        productsServices: formData.productsServices,
        vendor_fee: vendorTypes.find(t => t.value === formData.vendorType)?.fee || '',
        sponsorshipInterest: formData.sponsorshipInterest,
        additionalInfo: formData.additionalInfo,
        _gotcha: '', // Honeypot field
      };

      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitMessage('Thank you for your vendor application! We will contact you soon with next steps and payment information.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          pronouns: '',
          company: '',
          vendorType: 'forprofit',
          website: '',
          socialMedia: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          productsServices: '',
          vendorFee: '',
          sponsorshipInterest: '',
          additionalInfo: '',
          agreeToTerms: false,
          agreeToPhotoRelease: false,
          agreeToTextMessages: false,
          understandContract: false,
        });
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitMessage(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedVendorType = vendorTypes.find(t => t.value === formData.vendorType);

  const progressPercentage = useMemo(() => {
    const requiredFields = ['name', 'email', 'company', 'address', 'city', 'state', 'postalCode', 'vendorType', 'productsServices'];
    const filledFields = requiredFields.filter(field => {
      const value = formData[field as keyof VendorFormData];
      return typeof value === 'string' ? value.trim() !== '' : Boolean(value);
    });
    const checkboxFields = ['agreeToTerms', 'agreeToPhotoRelease'];
    const checkedBoxes = checkboxFields.filter(field => Boolean(formData[field as keyof VendorFormData]));
    
    const totalRequired = requiredFields.length + checkboxFields.length;
    const completed = filledFields.length + checkedBoxes.length;
    return Math.round((completed / totalRequired) * 100);
  }, [formData]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-4">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-4">Katy Pride 2026 Vendor Application</h1>
        <p className="text-lg text-gray-700 mb-2">Saturday, October 3, 2026 • 11AM - 4PM</p>
        <p className="text-md text-gray-600">Bear Creek Rodeo Arena, Houston, TX</p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
          <span className="text-white font-bold text-sm">STAND TALL, Y'ALL!</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Application Progress</span>
          <span className="text-sm font-medium text-[#760088]">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#760088] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Honeypot - hidden from real users, bots auto-fill it */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" suppressHydrationWarning={true} />

        {/* Contact Information */}
        <div className="border-b pb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 mb-2">
                Pronouns (optional)
              </label>
              <input
                type="text"
                id="pronouns"
                name="pronouns"
                value={formData.pronouns}
                onChange={handleInputChange}
                placeholder="e.g., she/her, he/him, they/them"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="border-b pb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Business/Organization Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.company ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="vendorType" className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Type *
              </label>
              <select
                id="vendorType"
                name="vendorType"
                value={formData.vendorType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                {vendorTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.fee}
                  </option>
                ))}
              </select>
              {selectedVendorType && (
                <p className="mt-1 text-sm text-purple-600 font-medium">
                  Vendor Fee: {selectedVendorType.fee}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.website ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>

            <div>
              <label htmlFor="socialMedia" className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Links
              </label>
              <input
                type="text"
                id="socialMedia"
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleInputChange}
                placeholder="Instagram, Facebook, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-b pb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Business Address</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  maxLength={2}
                  placeholder="TX"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white uppercase ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="77084"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Event Information */}
        <div className="border-b pb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Event Information</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="productsServices" className="block text-sm font-medium text-gray-700 mb-2">
                Products/Services/Menu Sold *
              </label>
              <textarea
                id="productsServices"
                name="productsServices"
                value={formData.productsServices}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Please describe what products or services you will offer at the event..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white ${
                  errors.productsServices ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.productsServices && <p className="mt-1 text-sm text-red-600">{errors.productsServices}</p>}
            </div>

            <div>
              <label htmlFor="sponsorshipInterest" className="block text-sm font-medium text-gray-700 mb-2">
                Sponsorship Interest (optional)
              </label>
              <select
                id="sponsorshipInterest"
                name="sponsorshipInterest"
                value={formData.sponsorshipInterest}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                <option value="">Select sponsorship level (optional)</option>
                {sponsorshipLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information or special requirements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Terms and Conditions</h2>
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Vendor Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All vendor booth spaces are 10x10 (Platinum sponsors get 10x20)</li>
                <li>Vendors must provide their own tents, tables, and chairs</li>
                <li>Tent weights are required (failure results in $100 penalty)</li>
                <li>Setup begins at 7AM on event day</li>
                <li>No electricity provided (generators allowed with coordination)</li>
                <li>Must stay for entire event (11AM - 4PM)</li>
                <li>Family-friendly, all-ages event</li>
                <li>Rain or shine event</li>
                <li>Fees are non-refundable and non-transferable</li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I agree to the vendor requirements and terms listed above. I understand that vendor fees are non-refundable and non-transferable.
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToPhotoRelease"
                  checked={formData.agreeToPhotoRelease}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I grant permission to Katy Pride LGBTQ, Inc. to use photographs, videos, or media captured at the event for promotional purposes.
                </span>
              </label>
              {errors.agreeToPhotoRelease && <p className="text-sm text-red-600">{errors.agreeToPhotoRelease}</p>}

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTextMessages"
                  checked={formData.agreeToTextMessages}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  By providing my phone number, I agree to receive text messages from Katy Pride.
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="understandContract"
                  checked={formData.understandContract}
                  onChange={handleInputChange}
                  className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  I understand that a contract will be sent after payment. The contract must be signed to complete my vendor registration.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-12 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Vendor Application'}
          </button>

          {submitMessage && (
            <div className={`mt-6 p-4 rounded-md text-sm max-w-2xl text-center ${
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
};

export default VendorApplicationForm;

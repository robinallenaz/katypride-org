'use client';

import React, { useState } from 'react';

interface CRMContactFormProps {
  type: 'volunteer' | 'donor' | 'community-member';
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

const CRMContactForm: React.FC<CRMContactFormProps> = ({ type, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: [] as string[],
    availability: '',
    amount: '',
    frequency: 'one-time' as 'one-time' | 'monthly',
    pronouns: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const payload: Record<string, any> = {
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        _gotcha: (document.querySelector('input[name="_gotcha"]') as HTMLInputElement)?.value || '',
      };

      switch (type) {
        case 'volunteer':
          payload.interests = formData.interests;
          payload.availability = formData.availability;
          break;
        case 'donor':
          payload.amount = formData.amount ? parseFloat(formData.amount) : undefined;
          payload.frequency = formData.frequency;
          break;
        case 'community-member':
          payload.interests = formData.interests;
          payload.pronouns = formData.pronouns;
          break;
      }

      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitMessage('Thank you! Your information has been submitted successfully.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          interests: [],
          availability: '',
          amount: '',
          frequency: 'one-time',
          pronouns: '',
        });
        onSuccess?.(result.data);
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitMessage(`Error: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const volunteerInterests = [
    'Event Planning',
    'Community Outreach',
    'Youth Programs',
    'Fundraising',
    'Social Media',
    'Administrative Support',
    'Mentorship',
    'Healthcare Support',
  ];

  const communityInterests = [
    'LGBTQ+ Advocacy',
    'Youth Support',
    'Parent Resources',
    'Ally Programs',
    'Education',
    'Health & Wellness',
    'Legal Support',
    'Faith Communities',
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-purple-600 mb-6">
        {type === 'volunteer' && 'Volunteer with Katy Pride'}
        {type === 'donor' && 'Support Katy Pride'}
        {type === 'community-member' && 'Join Our Community'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot — hidden from real users, bots auto-fill it */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
            />
          </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
          />
        </div>

        {/* Volunteer Specific Fields */}
        {type === 'volunteer' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest (check all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {volunteerInterests.map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <textarea
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                rows={3}
                placeholder="Please describe your availability (e.g., weekends, evenings, specific days)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              />
            </div>
          </>
        )}

        {/* Donor Specific Fields */}
        {type === 'donor' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                >
                  <option value="one-time">One-time</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Community Member Specific Fields */}
        {type === 'community-member' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest (check all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {communityInterests.map(interest => (
                  <label key={interest} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes(interest)}
                      onChange={() => handleInterestToggle(interest)}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
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
          </>
        )}

        {/* Submit Button */}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>

          {submitMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
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

export default CRMContactForm;

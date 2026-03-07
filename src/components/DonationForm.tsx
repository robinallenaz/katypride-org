'use client'

import { useState } from 'react'

interface DonationFormData {
  name: string
  email: string
  phone: string
  donationAmount: string
  donationFrequency: 'one-time' | 'monthly'
  customAmount: string
  anonymous: boolean
  comments: string
  honeypot: string
}

interface DonationFormProps {
  onSuccess?: () => void
  className?: string
}

export default function DonationForm({ onSuccess, className = '' }: DonationFormProps) {
  const [formData, setFormData] = useState<DonationFormData>({
    name: '',
    email: '',
    phone: '',
    donationAmount: '50',
    donationFrequency: 'one-time',
    customAmount: '',
    anonymous: false,
    comments: '',
    honeypot: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const predefinedAmounts = ['25', '50', '100', '250', '500', '1000']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []

    if (!formData.name.trim()) errors.push('Name is required')
    if (!formData.email.trim()) errors.push('Email is required')
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address')
    }

    if (formData.phone) {
      const phoneRegex = /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
      const cleanPhone = formData.phone.replace(/[^0-9]/g, '')
      if (!phoneRegex.test(formData.phone) || cleanPhone.length !== 10) {
        errors.push('Please enter a valid US phone number')
      }
    }

    if (formData.donationAmount === 'custom' && !formData.customAmount.trim()) {
      errors.push('Please enter a custom donation amount')
    }

    if (formData.donationAmount === 'custom' && formData.customAmount && (parseFloat(formData.customAmount) < 1 || isNaN(parseFloat(formData.customAmount)))) {
      errors.push('Please enter a valid donation amount (minimum $1)')
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join('. '))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Honeypot check - if filled, it's a bot
    if (formData.honeypot) {
      setErrorMessage('Invalid submission')
      return
    }

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const finalAmount = formData.donationAmount === 'custom' ? formData.customAmount : formData.donationAmount

      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'donor',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          donation_frequency: formData.donationFrequency,
          last_donation_amount: parseFloat(finalAmount),
          anonymous: formData.anonymous,
          comments: formData.comments,
          _gotcha: formData.honeypot
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          donationAmount: '50',
          donationFrequency: 'one-time',
          customAmount: '',
          anonymous: false,
          comments: '',
          honeypot: ''
        })
        onSuccess?.()
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to process donation. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Thank You for Your Donation!</h3>
        <p className="text-green-700 mb-4">
          Your generous support helps us continue our mission to empower the LGBTQ+ community in Katy and West Houston.
        </p>
        <p className="text-green-600 text-sm">
          You should receive a confirmation email shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {submitStatus === 'error' && errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Hidden honeypot field for bots */}
      <input
        type="text"
        name="honeypot"
        value={formData.honeypot}
        onChange={handleInputChange}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="John Doe"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="john@example.com"
          />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Donation Amount */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Donation Amount</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {predefinedAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, donationAmount: amount, customAmount: '' }))}
              className={`py-3 px-4 border rounded-md font-medium transition-colors ${
                formData.donationAmount === amount
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="customAmount"
              name="customAmount"
              value={formData.customAmount}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, donationAmount: 'custom', customAmount: e.target.value }))
              }}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter amount"
              min="1"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Donation Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Donation Frequency</h3>
        
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="donationFrequency"
              value="one-time"
              checked={formData.donationFrequency === 'one-time'}
              onChange={handleInputChange}
              className="mr-2 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-gray-700">One-time</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              name="donationFrequency"
              value="monthly"
              checked={formData.donationFrequency === 'monthly'}
              onChange={handleInputChange}
              className="mr-2 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-gray-700">Monthly</span>
          </label>
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            name="anonymous"
            checked={formData.anonymous}
            onChange={handleInputChange}
            className="mr-2 text-purple-600 focus:ring-purple-500 rounded"
          />
          <label htmlFor="anonymous" className="text-gray-700">
            Make this donation anonymous
          </label>
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
            Comments (Optional)
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Any special instructions or messages..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Processing...' : 'Complete Donation'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your information is secure and will never be shared with third parties.
      </p>
    </form>
  )
}

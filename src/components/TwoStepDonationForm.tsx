'use client'

import { useState } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

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

interface DonationFormData {
  // Step 1: Contact Info
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  
  // Step 2: Donation Selection
  donationType: 'one-time' | 'monthly'
  donationAmount: string
  customAmount: string
  paymentMethod: 'card' | 'google-pay' | 'amazon-pay'
}

interface TwoStepDonationFormProps {
  onSuccess?: () => void
  className?: string
}

export default function TwoStepDonationFormWrapper({ onSuccess, className = '' }: TwoStepDonationFormProps) {
  const stripe = getStripe()
  
  if (!stripe) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-red-50 rounded-lg text-red-700">
        Payment system is not configured. Please contact support.
      </div>
    )
  }

  return (
    <Elements stripe={stripe}>
      <TwoStepDonationForm onSuccess={onSuccess} className={className} />
    </Elements>
  )
}

function TwoStepDonationForm({ onSuccess, className = '' }: TwoStepDonationFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<DonationFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    donationType: 'one-time',
    donationAmount: '25',
    customAmount: '',
    paymentMethod: 'card'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const predefinedAmounts = ['10', '15', '25', '50', '100']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-\(\)\+]+$/.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'ZIP code is required'
    } else if (formData.country === 'United States' && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid US ZIP code (e.g., 77494 or 77494-1234)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep1()) {
      return
    }

    // Submit contact info to CRM first
    try {
      const payload = {
        type: 'donor' as const,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        source: 'Donation Form Step 1',
        _gotcha: '', // Honeypot field
      }

      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setCurrentStep(2)
      } else {
        throw new Error('Failed to save contact information')
      }
    } catch (error) {
      console.error('Step 1 submission error:', error)
      setSubmitMessage('There was an error saving your information. Please try again.')
    }
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setSubmitMessage('Payment system is not ready. Please try again.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const amount = formData.donationAmount === 'custom' ? formData.customAmount : formData.donationAmount
      
      const numericAmount = parseFloat(amount || '0')
      
      if (!numericAmount || numericAmount <= 0) {
        throw new Error('Please enter a valid donation amount')
      }
      
      if (numericAmount > 50000) {
        throw new Error('Donation amount cannot exceed $50,000')
      }

      // Validate and convert amount to cents safely
      const amountString = numericAmount.toFixed(2);
      const [dollars, cents] = amountString.split('.');
      const amountInCents = parseInt(dollars, 10) * 100 + parseInt(cents, 10);

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInCents,
          currency: 'usd',
          payment_method_type: 'card',
          donor_email: formData.email,
          donor_name: formData.name,
          donation_frequency: formData.donationType,
          _gotcha: '', // Honeypot field
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment intent')
      }

      const { paymentIntent } = await response.json()

      // Confirm payment with card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card information is required')
      }

      let confirmedPayment;
      try {
        const { error, paymentIntent: confirmed } = await stripe.confirmCardPayment(
          paymentIntent.client_secret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: formData.name,
                email: formData.email,
                address: {
                  line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.postalCode,
                  country: formData.country === 'United States' ? 'US' : formData.country,
                },
              },
            },
          }
        )

        if (error) {
          throw new Error(error.message || 'Payment failed')
        }
        confirmedPayment = confirmed;
      } catch (paymentError) {
        // Update CRM with failed status before propagating error
        try {
          await fetch('/api/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'donor',
              email: formData.email,
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
              type: 'donor',
              email: formData.email,
              paymentStatus: 'failed',
              paymentIntentId: confirmedPayment.id,
              paymentError: '3D Secure authentication incomplete',
            }),
          });
        } catch (crmError) {
          console.warn('Failed to update CRM with payment failure:', crmError);
        }
        throw new Error('Payment authentication incomplete. Please complete the verification or use a different card.')
      }

      if (confirmedPayment.status === 'succeeded') {
        // Update CRM with payment status (non-blocking - don't fail if CRM update fails)
        try {
          const crmUpdateResponse = await fetch('/api/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'donor',
              email: formData.email,
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

        // Clear sensitive form data before redirect
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'United States',
          donationType: 'one-time',
          donationAmount: '25',
          customAmount: '',
          paymentMethod: 'card'
        })

        // Payment succeeded - redirect to success page
        window.location.href = `/donate/success?payment_intent=${confirmedPayment.id}&redirect_status=succeeded`
      } else {
        throw new Error('Payment was not completed')
      }

    } catch (error) {
      console.error('Payment error:', error)
      setSubmitMessage(error instanceof Error ? error.message : 'There was an error processing your donation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDonationDisplay = (amount: string, type: string) => {
    if (type === 'monthly') {
      return `Recurring $${amount} Donation x 12 months`
    }
    return `One-Time $${amount} Donation`
  }

  const getDonationPrice = (amount: string, type: string) => {
    if (type === 'monthly') {
      return `$${amount} per month`
    }
    return `$${amount}.00`
  }

  if (currentStep === 1) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-6">Contact Info</h2>
          
          <form onSubmit={handleStep1Submit} className="space-y-6">
            {/* Honeypot — hidden from real users, bots auto-fill it */}
            <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" suppressHydrationWarning={true} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="John Doe"
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

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
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                  errors.address ? 'border-red-500' : ''
                }`}
                placeholder="123 Main Street"
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                    errors.city ? 'border-red-500' : ''
                  }`}
                  placeholder="Katy"
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
                  required
                  maxLength={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 uppercase ${
                    errors.state ? 'border-red-500' : ''
                  }`}
                  placeholder="TX"
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
                  required
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700 ${
                    errors.postalCode ? 'border-red-500' : ''
                  }`}
                  placeholder="77494"
                />
                {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>We Respect Your Privacy & Information.</strong> Your personal information will be kept secure and used only for donation processing and Katy Pride communications.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Go To Step #2
            </button>

            {submitMessage && (
              <div className={`p-4 rounded-md text-sm ${
                submitMessage.includes('Thank you') || submitMessage.includes('success')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    )
  }

  // Step 2: Donation Selection
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Select Donation Amount</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Options */}
          <div className="lg:col-span-2">
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Donation Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="donationType"
                      value="one-time"
                      checked={formData.donationType === 'one-time'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-900">One-Time Donation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="donationType"
                      value="monthly"
                      checked={formData.donationType === 'monthly'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-900">Monthly Supporter</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <label key={amount} className="relative">
                      <input
                        type="radio"
                        name="donationAmount"
                        value={amount}
                        checked={formData.donationAmount === amount}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-gray-300 transition-all">
                        <div className="font-semibold text-lg text-gray-900">
                          {formData.donationType === 'monthly' 
                            ? `$${amount}/month`
                            : `$${amount}`
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.donationType === 'monthly' 
                            ? `Recurring x 12 months`
                            : 'One-time donation'
                          }
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  <label className="relative">
                    <input
                      type="radio"
                      name="donationAmount"
                      value="custom"
                      checked={formData.donationAmount === 'custom'}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-gray-300 transition-all">
                      <div className="font-semibold text-lg text-gray-900">Custom</div>
                      <div className="text-xs text-gray-500 mt-1">Enter amount</div>
                    </div>
                  </label>
                </div>

                {formData.donationAmount === 'custom' && (
                  <div className="mt-4">
                    <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Custom Amount
                    </label>
                    <input
                      type="number"
                      id="customAmount"
                      name="customAmount"
                      value={formData.customAmount}
                      onChange={handleInputChange}
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-700"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.paymentMethod === 'card' 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="flex items-center w-full">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-white text-sm">💳</span>
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium text-gray-900">Credit/Debit Card</div>
                        <div className="text-xs text-gray-500">Visa, Mastercard, American Express</div>
                      </div>
                    </div>
                  </label>
                  
                  {formData.paymentMethod === 'card' && (
                    <div className="mt-3 p-4 border border-gray-300 rounded-lg bg-white">
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
                                  color: '#6b7280',
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
                        Your card information is securely processed by Stripe.
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Note: Additional payment methods (Google Pay, Amazon Pay) will be available soon.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (formData.donationAmount === 'custom' && !formData.customAmount) || (formData.donationAmount === 'custom' && parseFloat(formData.customAmount) > 50000)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-md hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🛒</span>
                  <span>Complete Donation</span>
                </span>
                {isSubmitting && (
                  <span className="block text-sm mt-1">Processing...</span>
                )}
              </button>

              {submitMessage && (
                <div className={`p-4 rounded-md text-sm ${
                  submitMessage.includes('Thank you')
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-900">
                  <span>Item</span>
                  <span>Quantity</span>
                  <span>Amount</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm text-gray-900">
                    <span>{getDonationDisplay(formData.donationAmount === 'custom' ? formData.customAmount : formData.donationAmount, formData.donationType)}</span>
                    <span>1</span>
                    <span>{getDonationPrice(formData.donationAmount === 'custom' ? formData.customAmount : formData.donationAmount, formData.donationType)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Order Total</span>
                  <span>${formData.donationAmount === 'custom' ? parseFloat(formData.customAmount || '0').toFixed(2) : parseFloat(formData.donationAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  <strong>* 100% Secure & Safe Payments *</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

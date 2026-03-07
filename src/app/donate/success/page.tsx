'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DonationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent')
    const paymentStatus = searchParams.get('redirect_status')
    const transactionId = searchParams.get('payment_intent_client_secret')?.split('_secret')[0]

    if (paymentIntentId && paymentStatus === 'succeeded') {
      // Track successful payment in CRM
      const trackPayment = async () => {
        try {
          const response = await fetch('/api/track-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              status: 'completed',
              transactionId: transactionId || paymentIntentId,
              paymentMethod: 'stripe',
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to track payment')
          }
        } catch (error) {
          console.error('Error tracking payment:', error)
          setError('Payment was successful but we had trouble updating our records. Please contact us if you don\'t receive a confirmation email.')
        } finally {
          setIsProcessing(false)
        }
      }

      trackPayment()
    } else {
      setError('Invalid payment status')
      setIsProcessing(false)
    }
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-purple-700 mb-2">Processing Your Donation...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push('/donate')}
              className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Return to Donation Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Thank You!</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Donation Was Successful</h2>
          <p className="text-gray-600 mb-6">
            Your generous support helps us continue our mission of empowering the LGBTQ+ community in Katy and West Houston.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Confirmation:</strong> A receipt has been sent to your email address.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-purple-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Return to Homepage
            </button>
            
            <button
              onClick={() => router.push('/newsletter')}
              className="w-full bg-purple-100 text-purple-700 font-semibold px-6 py-3 rounded-md hover:bg-purple-200 transition-colors"
            >
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

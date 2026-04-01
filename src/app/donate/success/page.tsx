'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function DonationSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentStatus = searchParams.get('redirect_status')

  const succeeded = paymentStatus === 'succeeded'

  if (!succeeded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Error</h2>
            <p className="text-gray-700 mb-6">There was a problem with your payment. Please try again.</p>
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
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  )
}

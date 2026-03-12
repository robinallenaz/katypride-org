'use client'

import { useRouter } from 'next/navigation'

export default function DonationCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-5xl mb-4">💔</div>
          <h1 className="text-3xl font-bold text-orange-600 mb-2">Payment Cancelled</h1>
          <p className="text-gray-700 mb-6">
            Your donation payment was cancelled. No charges were made to your card.
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>No worries:</strong> You can try again anytime. Your support means a lot to our community.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/donate')}
              className="w-full bg-purple-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
            >
              Try Donation Again
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-purple-100 text-purple-700 font-semibold px-6 py-3 rounded-md hover:bg-purple-200 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

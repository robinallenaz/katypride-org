'use client'

import { useState, useEffect } from 'react'

export default function PaymentTestPage() {
  const [stripeKey, setStripeKey] = useState<string>('')
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if Stripe key is available
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    setStripeKey(key || 'Not found')
  }, [])

  const testPaymentIntent = async () => {
    setIsLoading(true)
    setTestResult('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5000, // $50.00 in cents — Stripe minimum for USD is 50 cents
          currency: 'usd',
          payment_method_type: 'card',
          donor_email: 'test@example.com',
          donor_name: 'Test User',
          donation_frequency: 'one-time',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Success! Payment Intent ID: ${data.paymentIntent.id}\n\nThis confirms your STRIPE_SECRET_KEY is valid and the server can create payment intents.\nNote: This creates a real intent in Stripe Dashboard → Payments (test it, then cancel/refund).`)
      } else {
        const error = await response.text()
        setTestResult(`❌ Error (${response.status}):\n${error}\n\nThis usually means STRIPE_SECRET_KEY is invalid, expired, or from a different Stripe account/mode than the publishable key.`)
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Integration Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Stripe Configuration</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Publishable Key:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {stripeKey.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Key Type:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  stripeKey.startsWith('pk_live_') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stripeKey.startsWith('pk_live_') ? 'Live Key' : 'Test Key'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">API Test</h2>
            <button
              onClick={testPaymentIntent}
              disabled={isLoading || !stripeKey}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test Payment Intent Creation'}
            </button>
            
            {testResult && (
              <div className="mt-4 p-4 rounded-md bg-gray-50 border border-gray-200">
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Next Steps</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>If the test succeeds, the payment intent creation is working</li>
              <li>You need the Stripe secret key to complete the integration</li>
              <li>Contact Travis at CRF for the secret key</li>
              <li>Once you have the secret key, update STRIPE_SECRET_KEY in .env.local</li>
              <li>Then test the full donation flow on the /donate page</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

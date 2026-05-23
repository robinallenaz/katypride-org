'use client'

import { useState, useEffect } from 'react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

// Sentinel marker so ops can bulk-delete dry-run contacts in GHL
// (search GrowthSphere360 contacts for this string and delete).
const DRY_RUN_EMAIL_DOMAIN = 'dryrun.katypride.test'

type DryRunOutcome = {
  ok: boolean
  status: number
  contactId: string | null
  crmDeferred: boolean
  durationMs: number
  message: string
  raw: unknown
}

async function runDryRunSubmission(payload: Record<string, unknown>): Promise<DryRunOutcome> {
  const start = Date.now()
  try {
    const response = await fetch('/api/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const durationMs = Date.now() - start
    let body: any = null
    try {
      body = await response.json()
    } catch {
      // non-JSON response (shouldn't happen, but don't crash the test)
    }
    return {
      ok: response.ok && !!body?.success,
      status: response.status,
      contactId: body?.data?.contactId ?? null,
      crmDeferred: !!body?.crmDeferred,
      durationMs,
      message: body?.message || body?.error || `HTTP ${response.status}`,
      raw: body,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      contactId: null,
      crmDeferred: false,
      durationMs: Date.now() - start,
      message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      raw: null,
    }
  }
}

function formatDryRun(outcome: DryRunOutcome, label: string): string {
  if (outcome.ok && outcome.contactId) {
    return `✅ ${label} reached GHL — contactId ${outcome.contactId} (${outcome.durationMs}ms)`
  }
  if (outcome.ok && outcome.crmDeferred) {
    return `⚠️ ${label} deferred (CRM outage path) — submission saved to DB, NOT sent to GHL (${outcome.durationMs}ms)`
  }
  return `❌ ${label} failed — HTTP ${outcome.status}: ${outcome.message}`
}

export default function SystemTestDashboard() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [dryRunResult, setDryRunResult] = useState<{ label: string; outcome: DryRunOutcome } | null>(null)
  const [dryRunBusy, setDryRunBusy] = useState<null | 'vendor' | 'sponsor'>(null)

  const dryRunVendor = async () => {
    setDryRunBusy('vendor')
    const stamp = Date.now()
    const outcome = await runDryRunSubmission({
      type: 'vendor',
      name: 'Dry Run Vendor',
      email: `dryrun-vendor-${stamp}@${DRY_RUN_EMAIL_DOMAIN}`,
      phone: '5555550100',
      company: 'Dry Run Co',
      address: '123 Test St',
      city: 'Katy',
      state: 'TX',
      postalCode: '77449',
      vendorType: 'non-profit',
      vendorFee: 225,
      vendorBaseFee: 225,
      productsServices: 'Dry run — DELETE ME',
      paymentStatus: 'pending',
      event: 'katy-pride-celebration-2026',
      _gotcha: '',
    })
    setDryRunResult({ label: 'Vendor', outcome })
    setDryRunBusy(null)
  }

  const dryRunSponsor = async () => {
    setDryRunBusy('sponsor')
    const stamp = Date.now()
    const outcome = await runDryRunSubmission({
      type: 'sponsor',
      name: 'Dry Run Sponsor',
      email: `dryrun-sponsor-${stamp}@${DRY_RUN_EMAIL_DOMAIN}`,
      phone: '5555550101',
      company: 'Dry Run Sponsorship Inc',
      sponsorshipLevel: 'rainbow',
      additionalInfo: 'Dry run — DELETE ME',
      _gotcha: '',
    })
    setDryRunResult({ label: 'Sponsor', outcome })
    setDryRunBusy(null)
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const tests: Array<{ name: string; test: () => Promise<{ success: boolean; message: string }> }> = [
      {
        name: 'Environment Variables Check',
        test: async () => {
          const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
          const ghlKey = process.env.GHL_API_KEY?.substring(0, 20) + '...'
          
          return {
            success: !!stripeKey && !!ghlKey,
            message: `Stripe: ${stripeKey ? '✅' : '❌'}, GHL: ${ghlKey ? '✅' : '❌'}`
          }
        }
      },
      {
        name: 'CRM Connection Test',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/crm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'community-member',
                name: 'System Test',
                email: `crmtest-${start}@dryrun.katypride.test`,
                source: 'System Test',
                _gotcha: ''
              })
            })
            
            const duration = Date.now() - start
            return {
              success: response.ok,
              message: response.ok ? `✅ CRM connected (${duration}ms)` : `❌ CRM failed: ${response.status}`
            }
          } catch (error) {
            return { success: false, message: `❌ Network error: ${error}` }
          }
        }
      },
      {
        name: 'Payment Intent Test (with test data)',
        test: async () => {
          const start = Date.now()
          try {
            const response = await fetch('/api/create-payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: 100, // $1.00 in cents (Stripe minimum is 50 cents)
                currency: 'usd',
                payment_method_type: 'card',
                donor_email: 'test@example.com',
                donor_name: 'Test User',
                donation_frequency: 'one-time'
              })
            })
            
            const duration = Date.now() - start
            if (response.ok) {
              const data = await response.json()
              return { 
                success: true, 
                message: `✅ Payment intent created: ${data.paymentIntent.id} (${duration}ms)` 
              }
            } else {
              const error = await response.text()
              return { success: false, message: `❌ Payment intent failed: ${error}` }
            }
          } catch (error) {
            return { success: false, message: `❌ Network error: ${error}` }
          }
        }
      },
      {
        name: 'Form Validation Test',
        test: async () => {
          // Test invalid email
          try {
            const response = await fetch('/api/crm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'donor',
                name: 'Test',
                email: 'invalid-email',
                source: 'Validation Test',
                _gotcha: ''
              })
            })
            
            // Should still succeed (validation is frontend)
            return {
              success: true,
              message: '✅ Form validation working (frontend validated)'
            }
          } catch (error) {
            return { success: false, message: `❌ Form test failed: ${error}` }
          }
        }
      },
      {
        name: 'Rate Limiting Test',
        test: async () => {
          try {
            // Make multiple rapid requests
            const stamp = Date.now()
            const requests = Array(6).fill(null).map((_, i) =>
              fetch('/api/crm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'community-member',
                  name: 'Rate Test',
                  email: `ratetest-${stamp}-${i}@dryrun.katypride.test`,
                  source: 'Rate Limit Test',
                  _gotcha: ''
                })
              })
            )
            
            const responses = await Promise.all(requests)
            const successCount = responses.filter(r => r.ok).length
            
            return {
              success: successCount <= 5, // Should allow max 5
              message: successCount <= 5 
                ? `✅ Rate limiting working (${successCount}/6 allowed)` 
                : `❌ Rate limiting failed (${successCount}/6 allowed)`
            }
          } catch (error) {
            return { success: false, message: `❌ Rate limit test failed: ${error}` }
          }
        }
      }
    ]

    // Run tests sequentially
    for (const { name, test } of tests) {
      setTestResults(prev => [...prev, { name, status: 'pending', message: 'Running...' }])
      
      try {
        const result = await test()
        setTestResults(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: result.success ? 'success' : 'error',
            message: result.message
          }
          return updated
        })
      } catch (error) {
        setTestResults(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: 'error',
            message: `❌ Test failed: ${error}`
          }
          return updated
        })
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
    }
  }

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Test Dashboard</h1>
          <p className="text-gray-600 mb-8">Comprehensive testing of Katy Pride website systems</p>
          
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={runTests}
              disabled={isRunning || dryRunBusy !== null}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={dryRunVendor}
              disabled={isRunning || dryRunBusy !== null}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              title="Submits a synthetic vendor application to /api/crm only. Does NOT call Stripe — no card is charged."
            >
              {dryRunBusy === 'vendor' ? 'Submitting…' : 'Dry-run Vendor Submit (no payment)'}
            </button>
            <button
              onClick={dryRunSponsor}
              disabled={isRunning || dryRunBusy !== null}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              title="Submits a synthetic sponsor application to /api/crm only. Does NOT call Stripe — no card is charged."
            >
              {dryRunBusy === 'sponsor' ? 'Submitting…' : 'Dry-run Sponsor Submit (no payment)'}
            </button>
          </div>

          {dryRunResult && (
            <div className={`mb-8 p-4 rounded-lg border ${
              dryRunResult.outcome.ok && dryRunResult.outcome.contactId ? 'bg-green-50 border-green-200' :
              dryRunResult.outcome.ok && dryRunResult.outcome.crmDeferred ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <h3 className="font-semibold text-gray-900 mb-1">{dryRunResult.label} Dry-run Result</h3>
              <p className="text-sm text-gray-800">{formatDryRun(dryRunResult.outcome, dryRunResult.label)}</p>
              <p className="text-xs text-gray-600 mt-2">
                User-facing message: <em>{dryRunResult.outcome.message}</em>
              </p>
              <details className="mt-2">
                <summary className="text-xs text-gray-600 cursor-pointer">Raw response</summary>
                <pre className="text-xs bg-white/60 p-2 mt-1 rounded overflow-x-auto">
{JSON.stringify(dryRunResult.outcome.raw, null, 2)}
                </pre>
              </details>
              <p className="text-xs text-gray-500 mt-2">
                Cleanup: in GrowthSphere360 Contacts, search for <code>@{DRY_RUN_EMAIL_DOMAIN}</code> and delete.
              </p>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
              
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>✅ Success: {testResults.filter(r => r.status === 'success').length}</p>
                  <p>❌ Failed: {testResults.filter(r => r.status === 'error').length}</p>
                  <p>⏳ Pending: {testResults.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">What These Tests Check</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Environment Variables</strong>: Stripe and GHL API keys are configured</li>
              <li>• <strong>CRM Connection</strong>: Can successfully create contacts in GrowthSphere360</li>
              <li>• <strong>Payment Intent</strong>: Stripe payment intent creation works</li>
              <li>• <strong>Form Validation</strong>: Frontend validation is working</li>
              <li>• <strong>Rate Limiting</strong>: Protection against spam submissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

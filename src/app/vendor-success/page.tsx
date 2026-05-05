'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VendorSuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    if (!paymentIntentId) {
      setIsVerifying(false);
      setError({ code: 'NO_REFERENCE', message: 'No payment reference found' });
      return;
    }

    if (!redirectStatus) {
      setIsVerifying(false);
      setError({ code: 'INVALID_REDIRECT', message: 'Invalid access - must complete payment through Stripe' });
      return;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams({
          payment_intent: paymentIntentId,
          redirect_status: redirectStatus || ''
        });
        const response = await fetch(`/api/verify-payment-intent?${params.toString()}`);
        const data = await response.json();
        
        if (response.status === 503) {
          if (!cancelled) {
            setIsMaintenanceMode(true);
            setIsVerifying(false);
          }
          return;
        }
        
        if (!response.ok || !data.valid) {
          const error = new Error(data.error || 'Failed to verify payment');
          (error as any).code = data.code || 'UNKNOWN';
          throw error;
        }
        if (!cancelled) {
          setIsVerifying(false);
        }
      } catch (err) {
        if (!cancelled) {
          const code = (err && typeof err === 'object' && 'code' in err) ? String((err as { code: unknown }).code) : 'UNKNOWN';
          const message = err instanceof Error ? err.message : 'Failed to verify payment';
          setError({ code, message });
          setIsVerifying(false);
        }
      }
    };

    verifyPayment();
    return () => { cancelled = true; };
  }, [paymentIntentId]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Confirming your registration...</h2>
          <p className="text-gray-600 mt-2">Please wait while we verify your payment.</p>
        </div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payments Temporarily Disabled</h2>
          <p className="text-gray-600 mb-6">
            Our payment verification system is currently undergoing maintenance. 
            If you completed payment, your registration will be processed manually 
            and you&apos;ll receive a confirmation email within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    const isExpired = error.code === 'EXPIRED';
    const isInvalidRedirect = error.code === 'INVALID_REDIRECT';
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isExpired ? 'Verification Link Expired' : isInvalidRedirect ? 'Invalid Access' : 'Payment Status Unknown'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isExpired
              ? 'This verification link has expired. If you completed payment, you\'ll receive a confirmation email within a few minutes.'
              : isInvalidRedirect
              ? 'This page must be accessed through the Stripe payment flow. If you completed payment, check your email for confirmation.'
              : 'We couldn\'t verify your payment status. If you completed payment, don\'t worry! You\'ll receive a confirmation email within a few minutes.'
            }
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for registering as a vendor or sponsor for Katy Pride Celebration 2026!
          Your payment has been received and your spot is reserved.
        </p>

        <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-purple-800 mb-2">What happens next?</h3>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Check your email for a payment receipt</li>
            <li>• You&apos;ll receive a vendor agreement to sign within 2 business days</li>
            <li>• Event details and setup information will follow</li>
            <li>• Load-in begins at 7:00 AM on event day</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-6 py-3 border border-purple-600 text-purple-600 font-medium rounded-md hover:bg-purple-50 transition-colors"
          >
            View Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        </div>
      </div>
    }>
      <VendorSuccessContent />
    </Suspense>
  );
}

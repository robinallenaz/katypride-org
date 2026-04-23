'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, Mail, Calendar, Heart } from 'lucide-react';

const givebutterWidgetId = process.env.NEXT_PUBLIC_GIVEBUTTER_WIDGET_ID || '';

interface FallbackFormProps {
  onSuccess: () => void;
}

const FallbackEmailForm: React.FC<FallbackFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      onSuccess();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="Sam"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
            placeholder="Smith"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
          placeholder="example@email.com"
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe to Newsletter'}
      </button>
      <p className="text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </form>
  );
};

const NewsletterForm: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInjectedRef = useRef(false);
  const widgetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Ensure widget only renders on client side after hydration
    setIsMounted(true);
    
    // Check if widget already succeeded before hydration (rare but possible)
    if (typeof window !== 'undefined' && (window as Window & { givebutterSuccess?: boolean }).givebutterSuccess) {
      setIsSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleGivebutterSuccess = (event: Event) => {
      // Mark success globally to catch race conditions
      (window as Window & { givebutterSuccess?: boolean }).givebutterSuccess = true;
      setIsSuccess(true);
    };

    window.addEventListener('givebutter:success', handleGivebutterSuccess);
    window.addEventListener('givebutter:signup:success', handleGivebutterSuccess);

    return () => {
      window.removeEventListener('givebutter:success', handleGivebutterSuccess);
      window.removeEventListener('givebutter:signup:success', handleGivebutterSuccess);
    };
  }, [isMounted]);

  // Inject widget HTML only on client side
  useEffect(() => {
    if (!isMounted || !widgetContainerRef.current || isSuccess || hasInjectedRef.current || useFallback) return;

    // Check if widget ID is configured
    if (!givebutterWidgetId) {
      setIsLoading(false);
      setWidgetError('Newsletter signup is not configured. Please use the backup form below.');
      return;
    }

    // Mark as injected to prevent duplicate injection during Fast Refresh
    hasInjectedRef.current = true;

    setIsLoading(true);
    setWidgetError(null);

    // Inject widget immediately - custom element will upgrade itself
    try {
      // Re-use existing widget if available (from before Fast Refresh)
      if (widgetRef.current && widgetRef.current.isConnected) {
        widgetContainerRef.current!.appendChild(widgetRef.current);
      } else {
        const widget = document.createElement('givebutter-widget');
        widget.setAttribute('id', givebutterWidgetId);
        // Force width constraints before widget initializes
        widget.style.width = '100%';
        widget.style.maxWidth = '100%';
        widget.style.display = 'block';
        widgetRef.current = widget;
        widgetContainerRef.current!.appendChild(widget);
      }

      // Check if widget rendered content after 3 seconds
      const checkTimeout = setTimeout(() => {
        const widgetElement = widgetContainerRef.current?.querySelector('givebutter-widget');
        // Check for shadow root presence (Givebutter renders into shadow DOM)
        const hasContent = widgetElement && widgetElement.shadowRoot;
        if (hasContent) {
          setIsLoading(false);
          setWidgetError(null);
        } else {
          setIsLoading(false);
          setWidgetError('Our signup form is taking longer than expected to load. Please try using the backup form below, or refresh the page and try again.');
        }
      }, 3000);

      loadingTimeoutRef.current = checkTimeout;

      // Watch for widget size stabilization before hiding loader
      let lastHeight = 0;
      let stableCount = 0;
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height;
          // Consider stable if height changes less than 5px for 3 consecutive checks
          if (Math.abs(newHeight - lastHeight) < 5 && newHeight > 50) {
            stableCount++;
            if (stableCount >= 3) {
              setIsLoading(false);
              resizeObserver.disconnect();
            }
          } else {
            stableCount = 0;
          }
          lastHeight = newHeight;
        }
      });

      if (widgetContainerRef.current) {
        resizeObserver.observe(widgetContainerRef.current);
      }

      return () => resizeObserver.disconnect();
    } catch (error) {
      console.error('Error creating Givebutter widget:', error);
      setIsLoading(false);
      setWidgetError('Something went wrong loading our signup form. Please try the backup form below.');
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Remove widget from DOM on unmount (safe removal)
      widgetRef.current?.remove();
    };
  }, [isMounted, isSuccess, useFallback]);

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-700 mb-2">You're All Set!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for subscribing to the Katy Pride newsletter. Please check your inbox for a confirmation email.
            </p>
            
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-100 mb-6">
              <h3 className="font-heading text-lg font-semibold text-purple-700 mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <Mail className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-700 text-center">Check your inbox for our welcome email</p>
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-700 text-center">Watch for event announcements</p>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm text-gray-700 text-center">Join us in building community</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccess(false);
                hasInjectedRef.current = false;
                widgetRef.current = null;
              }}
              className="text-purple-600 hover:text-purple-800 underline text-sm"
            >
              Subscribe another email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <style>{`
        givebutter-widget {
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
        }
        givebutter-widget iframe {
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">Subscribe to Our Newsletter</h2>

        {useFallback ? (
          <FallbackEmailForm onSuccess={() => setIsSuccess(true)} />
        ) : (
          <>
            <div className="relative min-h-[300px]">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                  Loading signup form...
                </div>
              )}
              {widgetError && !isLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm mb-4">
                  <p>{widgetError}</p>
                </div>
              )}
              {/* Widget container - clipped during load */}
              <div 
                ref={widgetContainerRef}
                className={`w-full ${isLoading ? 'overflow-hidden' : ''}`}
                suppressHydrationWarning
              />
            </div>
            <button
              onClick={() => setUseFallback(true)}
              className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
            >
              Having trouble? Use backup form
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterForm;

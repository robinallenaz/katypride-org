'use client';

import Script from 'next/script';
import Link from 'next/link';

export default function VendorFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[#760088] mb-3">
            2026 Vendor Registration
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Complete the form below to register as a vendor for Katy Pride Celebration 2026.
            Payment and agreement details will be handled after submission.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden">
          <div className="h-[1450px] w-full">
            <iframe
              src="https://link.leadforge.agency/widget/form/ANHnhavGydDuPa4wvvSq"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '3px' }}
              id="inline-ANHnhavGydDuPa4wvvSq"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="2025 Vendor Form"
              data-height="1419"
              data-layout-iframe-id="inline-ANHnhavGydDuPa4wvvSq"
              data-form-id="ANHnhavGydDuPa4wvvSq"
              title="2025 Vendor Form"
            />
          </div>
        </div>

        <Script
          src="https://link.leadforge.agency/js/form_embed.js"
          strategy="afterInteractive"
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Prefer to pay online with a card? Use our{' '}
            <Link href="/vendor-signup" className="text-purple-700 font-semibold hover:underline">
              secure vendor signup
            </Link>{' '}
            instead.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2 bg-white text-purple-700 font-medium rounded-full hover:bg-purple-50 transition-colors border border-purple-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

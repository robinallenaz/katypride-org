import { Metadata } from 'next';
import CelebrationSponsorForm from '@/components/CelebrationSponsorForm';

export const metadata: Metadata = {
  title: 'Sponsor the Katy Pride Celebration | Katy Pride',
  description: 'Become a sponsor of the 2026 Katy Pride Celebration on Saturday, October 3. Multiple levels available from $250 to $10,000, plus exclusive naming opportunities.',
  openGraph: {
    title: 'Sponsor the 2026 Katy Pride Celebration',
    description: 'Partner with Katy Pride at one of Katy\'s largest community events. Gain visibility, connect with 2,000+ attendees, and show your commitment to inclusion.',
  },
};

const STATS = [
  { value: '2,000+', label: 'Expected Attendees' },
  { value: '70+', label: 'Vendor Booths' },
  { value: '16', label: '2025 Sponsors' },
  { value: '3rd Year', label: 'Annual Celebration' },
];

export default function SponsorCelebrationPage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#760088] text-white px-4 py-2 rounded-md font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
        <div id="main-content" className="max-w-6xl mx-auto px-4 py-12">

          {/* Hero */}
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#760088] uppercase tracking-widest mb-3">2026 Katy Pride Celebration</p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
              Become a Sponsor
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-2">
              <strong>Saturday, October 3, 2026 • 11AM–4PM</strong>
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Bear Creek Rodeo Arena · 3230 Hwy 6, Houston, TX 77084
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              Gain valuable exposure, connect with a diverse audience, and show your commitment to inclusivity at one of Katy&apos;s largest community events.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
              <a
                href="/sponsorship-packet%20(3).pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white border-2 border-[#760088] text-[#760088] px-6 py-3 rounded-full font-semibold hover:bg-[#EEEDFE] transition-colors gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Sponsor Packet (PDF)
              </a>
              <a
                href="/celebration"
                className="inline-flex items-center justify-center border border-purple-300 text-purple-700 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                About the Celebration
              </a>
            </div>
          </div>

          {/* Sponsor vs Vendor Callout */}
          <div className="bg-purple-50 border-l-4 border-[#760088] rounded-r-xl p-5 mb-10 max-w-4xl mx-auto">
            <h2 className="font-heading text-lg font-bold text-[#760088] mb-2">
              Looking to rent a vendor booth instead?
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">
              This page is for <strong>sponsorships</strong> — brand visibility, naming opportunities,
              and premium placement, with levels from $250 to $10,000.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              If you just want a <strong>vendor booth</strong> ($225–$300) to sell products, promote
              your organization, or share information at the event,{' '}
              <a href="/vendor-signup" className="text-[#760088] font-semibold underline hover:text-[#5a0666]">
                sign up as a vendor instead →
              </a>
            </p>
            <p className="text-xs text-gray-600 italic">
              Returning vendors: check your renewal email for a promo code good through May 31, 2026.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 text-center border border-purple-100/20 shadow">
                <div className="font-heading text-3xl font-bold text-[#760088] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Why Sponsor */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/20 shadow-xl p-8 mb-10">
            <h2 className="font-heading text-2xl font-bold text-[#760088] mb-6">Why Sponsor Katy Pride?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Stand Up as a Brand</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Demonstrate your commitment to diversity, equity, inclusion, and social responsibility. An affiliation with Katy Pride enhances your company&apos;s reputation and helps attract a diverse, socially conscious customer and employee base.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Speak Out for Equality</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Provide a powerful platform for your business to advocate for important issues. This alignment signals a commitment to promoting positive change while enabling your company to amplify its voice in support of LGBTQ+ rights.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100/20 shadow-xl p-8">
            <h2 className="font-heading text-2xl font-bold text-[#760088] mb-2">Sponsorship Application</h2>
            <p className="text-gray-600 mb-8">
              Complete the form below and our team will reach out within 2 business days to confirm your sponsorship and arrange payment. All fees are non-refundable and non-transferable.
            </p>
            <CelebrationSponsorForm />
          </div>

          {/* Contact */}
          <div className="text-center mt-10">
            <p className="text-gray-600">
              Questions? Contact us at{' '}
              <a href="mailto:info@katypride.org" className="text-[#760088] font-semibold hover:underline">
                info@katypride.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

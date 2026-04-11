import { Metadata } from 'next';
import SponsorSignupForm from '@/components/SponsorSignupForm';

export const metadata: Metadata = {
  title: 'Sponsor the Chase the Rainbow 5K | Katy Pride',
  description: 'Support Katy Pride and gain visibility for your organization through sponsorship of our Chase the Rainbow 5K fun run. Multiple sponsorship levels available.',
  openGraph: {
    title: 'Sponsor the Chase the Rainbow 5K | Katy Pride',
    description: 'Support Katy Pride and gain visibility for your organization through sponsorship of our Chase the Rainbow 5K fun run.',
    images: ['/events/coffee-meetup.png'],
  },
};

export default function SponsorSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-4 sm:mb-6">
            Sponsor the Chase the Rainbow 5K
          </h1>
          <p className="text-xl sm:text-2xl text-gray-800 mb-3 sm:mb-4">
            <strong>Support Katy Pride & Gain Visibility</strong>
          </p>
          <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8">
            Partner with us to create an inclusive community while showcasing your organization&apos;s commitment to diversity and inclusion.
          </p>
          
          {/* Sponsor Packet Download */}
          <div className="mb-6">
            <a
              href="/sponsorship-packet.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white border-2 border-[#760088] text-[#760088] px-6 py-3 rounded-full font-semibold hover:bg-[#EEEDFE] transition-colors gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Sponsor Packet (PDF)
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
            <a
              href="/5k"
              className="font-heading inline-flex items-center justify-center rounded-full border border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-md transition-all hover:bg-purple-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Back to 5K Info</span>
            </a>
            <a
              href="https://raceroster.com/events/2026/116853/chase-the-rainbow-stride-with-pride"
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading inline-flex items-center justify-center rounded-full bg-[#760088] px-6 sm:px-8 py-3 sm:py-4 font-bold text-white shadow-lg transition-all hover:bg-[#5a0666] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Register to Run</span>
            </a>
          </div>
        </div>

        <SponsorSignupForm />
      </div>
    </div>
  );
}

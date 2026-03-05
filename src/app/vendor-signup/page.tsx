import VendorSignupForm from '@/components/VendorSignupForm';

const sponsorshipTiers = [
  {
    name: 'Friends of',
    price: 250,
    bg: 'bg-purple-50',
    benefits: [
      'Personal name on website',
      'Personal name on sponsor list (not business name)',
    ],
  },
  {
    name: 'Rainbow',
    price: 500,
    bg: 'bg-purple-50',
    benefits: [
      'Name on Website',
      'Name on Sponsor List',
      '10 x 10 Booth',
    ],
  },
  {
    name: 'Silver',
    price: 1_000,
    bg: 'bg-gray-50',
    benefits: [
      'Name on Website',
      'Name on Sponsor List',
      '10 x 10 Booth',
      'Recognition on Social',
    ],
  },
  {
    name: 'Gold',
    price: 2_500,
    bg: 'bg-yellow-50',
    benefits: [
      'Logo on Website',
      'Name on Sponsor List',
      'Name on Print',
      'Name on T-shirt',
      '10 x 10 Booth with premium location',
      'Recognition on Social',
      '2 Tickets to Kick-off',
    ],
  },
  {
    name: 'Platinum',
    price: 5_000,
    bg: 'bg-indigo-50',
    benefits: [
      'Logo on Website',
      'Logo on Sponsor List',
      'Name on Print',
      'Logo on T-shirt',
      '10 x 20 Booth with premium location',
      'Featured on Social',
      '3 minutes of speaking',
      '4 Tickets to Kick-off',
    ],
  },
  {
    name: 'Title',
    price: 10_000,
    bg: 'bg-purple-100',
    benefits: [
      'Logo on all Celebration marketing',
      'Logo on Website',
      'Logo on Sponsor List',
      'Logo on Print Material',
      'Prime Logo on T-shirt',
      '10 x 20 Booth with premium location',
      'Headline on Social',
      '5 minutes of speaking',
      '8 Tickets to Kick-off',
    ],
  },
];

const exclusiveSponsors = [
  {
    name: 'Hospitality',
    price: 3_000,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      '10 x 10 booth space',
      "Logo'ed Banner on Volunteer Tent",
      '30 second commercial at festival',
    ],
  },
  {
    name: 'T-Shirt',
    price: 5_000,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      'Name on Print',
      '10 x 10 Booth space',
      '6 tickets to VIP party',
      '3 minute commercial at festival',
      'Featured on Social',
      'Logo on volunteer shirts',
    ],
  },
  {
    name: 'Kid Zone',
    price: 3_000,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      '10 x 10 Booth space',
      'Signage throughout kids zone with logo',
      '30 second commercial at festival',
    ],
  },
  {
    name: 'Swag Bag',
    price: 5_000,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      'Name on Print',
      '10 x 10 Booth space',
      '6 tickets to VIP party',
      '3 minute commercial at festival',
      'Featured on Social',
      'Logo on volunteer shirts',
    ],
  },
  {
    name: 'Wifi & Charging',
    price: 4_000,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      '10 x 10 Booth space',
      'Signage throughout event with logo and wifi login',
      "Charging stations with logo'ed signage (if provided by sponsor)",
    ],
  },
  {
    name: 'Entertainment',
    price: 7_500,
    benefits: [
      'Name on website',
      'Logo on Sponsor list',
      '10 x 10 Booth space',
      '8 tickets to VIP party',
      '1 min commercial at festival',
      'Entertainment Stage named after company',
      "Logo'ed Banner on main stage",
    ],
  },
];

export default function VendorSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-purple-700 mb-2">
              Katy Pride 2026 Celebration
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Vendors &amp; Sponsors
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-6 py-4 inline-block mb-6">
              <p className="text-purple-800 font-semibold text-lg">Saturday, October 3, 2026 &bull; 11 AM &ndash; 4 PM</p>
              <p className="text-purple-700 text-sm">Bear Creek Rodeo Arena &bull; 3230 Hwy 6, Houston, TX 77084</p>
            </div>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Invest in our community by showcasing your business at our annual celebration event. Let your business shine while interacting with over 2,000 attendees!
            </p>
          </div>

          {/* Vendor Pricing Overview */}
          <h3 className="font-heading text-2xl font-bold text-purple-700 text-center mb-6">Vendor Booths</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            <div className="bg-purple-50 rounded-lg p-5 text-center">
              <p className="text-xs text-purple-600 font-medium uppercase mb-1">Non-Profit</p>
              <p className="text-3xl font-bold text-purple-800">$225</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-5 text-center">
              <p className="text-xs text-purple-600 font-medium uppercase mb-1">For-Profit / Political / Government</p>
              <p className="text-3xl font-bold text-purple-800">$275</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-5 text-center">
              <p className="text-xs text-purple-600 font-medium uppercase mb-1">Food Truck</p>
              <p className="text-3xl font-bold text-purple-800">$300</p>
            </div>
          </div>

          {/* Vendor Form */}
          <VendorSignupForm />

          {/* Sponsorship Tiers */}
          <div className="mt-16 pt-12 border-t border-purple-100">
            <div className="text-center mb-10">
              <h3 className="font-heading text-3xl font-bold text-purple-700 mb-3">Celebration Sponsorships</h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Support Katy Pride and grow your business with a 2026 sponsorship. Gain valuable exposure, connect with a diverse audience, and show your commitment to inclusivity at one of Katy&apos;s largest community events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {sponsorshipTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-2xl border border-black/5 shadow-md p-6 flex flex-col ${tier.bg}`}
                >
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{tier.name}</p>
                    <p className="text-3xl font-bold text-purple-800 mt-1">
                      ${tier.price.toLocaleString()}
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start text-sm text-gray-700">
                        <span className="text-purple-500 mr-2 mt-0.5 shrink-0">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Exclusive Sponsorships */}
            <div className="text-center mb-10">
              <h3 className="font-heading text-2xl font-bold text-purple-700 mb-3">Exclusive Sponsorships</h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Invest in inclusion, visibility, and community by becoming an exclusive sponsor. Your business will gain premium exposure at our headline event.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {exclusiveSponsors.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-2xl border border-purple-200 shadow-md p-6 flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50"
                >
                  <div className="text-center mb-4">
                    <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{tier.name}</p>
                    <p className="text-3xl font-bold text-purple-800 mt-1">
                      ${tier.price.toLocaleString()}
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start text-sm text-gray-700">
                        <span className="text-indigo-500 mr-2 mt-0.5 shrink-0">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-center bg-purple-50 border border-purple-200 rounded-xl p-6">
              <p className="text-purple-800 font-semibold mb-2">Interested in sponsoring?</p>
              <p className="text-gray-700 text-sm">
                Contact us at{' '}
                <a href="mailto:info@katypride.org" className="text-purple-600 underline hover:text-purple-800">
                  info@katypride.org
                </a>{' '}
                to discuss sponsorship opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

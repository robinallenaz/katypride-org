import VendorApplicationForm from '@/components/VendorApplicationForm';

// Pride Celebration Sponsorship Tiers
const prideSponsorshipTiers = [
  {
    name: 'Friends of Pride',
    price: 250,
    bg: 'bg-pink-50',
    benefits: [
      'Personal name on sponsor list',
      'Recognition on website',
      'Support Katy Pride mission',
    ],
  },
  {
    name: 'Rainbow',
    price: 500,
    bg: 'bg-rainbow-gradient',
    benefits: [
      'Name on Website',
      'Name on Sponsor List',
      '10 x 10 Booth',
      'Recognition on Social',
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
      'Name on Print',
      'Name on T-shirt',
      '2 Tickets to Kick-off',
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

// Chase the Rainbow 5K Sponsorship Tiers
const fiveKSponsorshipTiers = [
  {
    name: 'Presenting Sponsor',
    price: 2_500,
    bg: 'bg-purple-100',
    benefits: [
      'Title: "Presented by" on event materials',
      'Logo on race shirts (largest placement)',
      'Recognition in all press releases and social media',
      'Option to provide promotional items for race bags',
      'Complimentary 6 race entries',
      'Premium Booth space in the festival area',
    ],
  },
  {
    name: 'Gold Sponsor',
    price: 1_000,
    bg: 'bg-yellow-50',
    benefits: [
      'Prominent logo on race shirts and signage',
      'Logo on event website and social media mentions',
      '4 complimentary race entries',
      'Option to provide promotional items for race bags',
      'Booth space in the festival area',
    ],
  },
  {
    name: 'Silver Sponsor',
    price: 500,
    bg: 'bg-gray-50',
    benefits: [
      'Medium logo on race shirts',
      'Option to provide promotional items for race bags',
      'Booth space in the festival area',
      '4 complimentary race entries',
    ],
  },
  {
    name: 'Bronze Sponsor',
    price: 250,
    bg: 'bg-orange-50',
    benefits: [
      'Small logo on race shirts',
      'Logo on Social Media',
      '2 complimentary race entries',
      'Option to provide promotional items for race bags',
    ],
  },
  {
    name: 'Community Sponsor',
    price: 100,
    bg: 'bg-green-50',
    benefits: [
      'Name listed on event website and signage',
      '1 complimentary race entry',
      'Option to include flyers or coupons in race bags',
    ],
  },
  {
    name: 'Kids Dash Sponsor',
    price: 1_000,
    bg: 'bg-pink-50',
    benefits: [
      'Logo on website, social media, signage & shirts',
      'Booth Placement at Kids Dash area/Finish Line',
      'Option to provide promotional items for race bags',
    ],
  },
  {
    name: 'Color Run Sponsor',
    price: 350,
    bg: 'bg-blue-50',
    benefits: [
      'Logo on website, signage & shirts',
      'Option to provide promotional items for race bags',
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
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#760088] text-white px-4 py-2 rounded-md font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
        <section id="main-content" className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-black/5 shadow-2xl p-8 md:p-12">
            
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                2026 Celebration
              </span>
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-purple-800 mb-4">
                Katy Pride Vendors &amp; Sponsors
              </h1>
            </div>
            
            {/* Event Details Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="text-2xl mb-2">🏳️‍🌈</div>
                  <h2 className="text-xl font-bold text-purple-800">Saturday, October 3, 2026</h2>
                  <span className="text-purple-600">•</span>
                  <h2 className="text-xl font-bold text-purple-800">11 AM – 4 PM</h2>
                </div>
                <div className="text-center text-purple-700 font-medium">
                  <a 
                    href="https://maps.google.com/?q=Bear+Creek+Rodeo+Arena+3230+Hwy+6+Houston+TX+77084"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-700 hover:text-purple-800 underline decoration-2 hover:decoration-purple-400 transition-colors"
                  >
                    Bear Creek Rodeo Arena • 3230 Hwy 6, Houston, TX 77084
                  </a>
                </div>
                <div className="mt-4 bg-white/50 rounded-lg p-4">
                  <p className="text-purple-800 font-medium">
                    <strong>Expected Attendance:</strong> 2,000+ community members
                  </p>
                  <p className="text-purple-700 text-sm mt-1">
                    Join us for the largest LGBTQ+ celebration in Katy and West Houston
                  </p>
                </div>
              </div>

              <p className="text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed">
                Showcase your business to thousands of attendees and support our mission of creating an inclusive, accepting community. Your partnership helps make this celebration possible!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white border border-purple-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🏪</div>
                <h3 className="font-semibold text-purple-700 mb-2">Vendor Booths</h3>
                <p className="text-gray-600 text-sm">10x10 spaces available for all vendor types</p>
              </div>
              <div className="bg-white border border-purple-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="font-semibold text-purple-700 mb-2">Sponsors</h3>
                <p className="text-gray-600 text-sm">6 sponsorship levels from $250 to $10,000</p>
              </div>
              <div className="bg-white border border-purple-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-purple-700 mb-2">Impact</h3>
                <p className="text-gray-600 text-sm">Support LGBTQ+ community in Katy & West Houston</p>
              </div>
            </div>

            {/* Vendor Pricing Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 mb-12">
              <h2 className="font-heading text-2xl font-bold text-purple-800 text-center mb-6">Vendor Booth Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-6 text-center border border-purple-200 shadow-sm">
                  <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Non-Profit</div>
                  <div className="text-2xl font-bold text-purple-800">$225</div>
                  <div className="text-xs text-gray-500 mt-1">501(c)(3) organizations</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-purple-200 shadow-sm">
                  <div className="text-xs font-semibold text-purple-600 uppercase mb-2">For-Profit</div>
                  <div className="text-2xl font-bold text-purple-800">$275</div>
                  <div className="text-xs text-gray-500 mt-1">Businesses &amp; Individuals</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-purple-200 shadow-sm">
                  <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Political</div>
                  <div className="text-2xl font-bold text-purple-800">$300</div>
                  <div className="text-xs text-gray-500 mt-1">Campaigns &amp; Organizations</div>
                </div>
                <div className="bg-white rounded-lg p-6 text-center border border-purple-200 shadow-sm">
                  <div className="text-xs font-semibold text-purple-600 uppercase mb-2">Government</div>
                  <div className="text-2xl font-bold text-purple-800">$300</div>
                  <div className="text-xs text-gray-500 mt-1">Government Entities</div>
                </div>
              </div>
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  <strong>All booths are 10x10 spaces. Platinum sponsors receive 10x20 spaces.</strong>
                </p>
              </div>
            </div>

            {/* Vendor Application Form */}
            <div className="bg-white rounded-2xl border border-purple-200 shadow-lg p-8 mb-12">
              <h2 className="font-heading text-2xl font-bold text-purple-800 text-center mb-6">Vendor Application</h2>
              <VendorApplicationForm />
            </div>

            {/* Sponsorship Tiers */}
            <div className="border-t border-purple-200 pt-12">
              <div className="text-center mb-8">
                <h2 className="font-heading text-3xl font-bold text-purple-800 mb-4">Sponsorship Opportunities</h2>
                <p className="text-gray-700 max-w-3xl mx-auto text-lg">
                  Become a sponsor and gain valuable exposure while supporting our mission of creating an inclusive community.
                </p>
              </div>

              {/* Pride Celebration Sponsorships */}
              <div className="mb-12">
                <h3 className="font-heading text-xl font-bold text-purple-700 text-center mb-2">Katy Pride 2026 Celebration</h3>
                <p className="text-center text-gray-600 mb-6">Saturday, October 3, 2026 • Bear Creek Rodeo Arena</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prideSponsorshipTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col hover:shadow-xl transition-shadow duration-200 ${tier.bg}`}
                    >
                      <div className="text-center mb-4">
                        <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{tier.name}</span>
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
              </div>

              {/* Chase the Rainbow 5K Sponsorships */}
              <div className="mb-12">
                <h3 className="font-heading text-xl font-bold text-purple-700 text-center mb-2">Chase the Rainbow 5K</h3>
                <p className="text-center text-gray-600 mb-6">Saturday, June 13, 2026 • John Paul Landing Park</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fiveKSponsorshipTiers.map((tier) => (
                    <div
                      key={tier.name}
                      className={`rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col hover:shadow-xl transition-shadow duration-200 ${tier.bg}`}
                    >
                      <div className="text-center mb-4">
                        <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{tier.name}</span>
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
              </div>

              {/* Exclusive Sponsorships */}
              <div className="mb-8">
                <h3 className="font-heading text-xl font-bold text-purple-700 text-center mb-6">Exclusive Sponsorships</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exclusiveSponsors.map((sponsor) => (
                    <div
                      key={sponsor.name}
                      className="rounded-2xl border border-black/5 shadow-lg p-6 flex flex-col hover:shadow-xl transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-indigo-50"
                    >
                      <div className="text-center mb-4">
                        <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">{sponsor.name}</span>
                        <p className="text-3xl font-bold text-purple-800 mt-1">
                          ${sponsor.price.toLocaleString()}
                        </p>
                      </div>
                      <ul className="space-y-2 flex-1">
                        {sponsor.benefits.map((b) => (
                          <li key={b} className="flex items-start text-sm text-gray-700">
                            <span className="text-purple-500 mr-2 mt-0.5 shrink-0">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-purple-200 pt-12">
              <div className="text-center">
                <h3 className="font-heading text-2xl font-bold text-purple-800 mb-4">Questions About Sponsorship?</h3>
                <p className="text-gray-700 mb-6">
                  We'd love to discuss how your business can partner with Katy Pride to support our community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:info@katypride.org" 
                    className="inline-flex items-center justify-center bg-[#760088] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a0066] transition-colors"
                  >
                    Email Us
                  </a>
                  <a 
                    href="tel:346-202-5289" 
                    className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Call (346) 202-5289
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
          

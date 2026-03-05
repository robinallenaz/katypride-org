import CRMContactForm from '@/components/CRMContactForm';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Support Katy Pride
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-8">
            Your generous support helps us create safe spaces, provide resources, and build a stronger LGBTQ+ community in Katy. 
            Every contribution, no matter the size, makes a meaningful difference in someone's life.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Donation Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-600">Your Impact</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🏳️‍🌈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Safe Spaces</h3>
                    <p className="text-gray-600">Fund youth programs, support groups, and community events that create safe spaces for LGBTQ+ individuals.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">📚</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Education & Resources</h3>
                    <p className="text-gray-600">Provide educational materials, workshops, and resources for schools, families, and community members.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🎉</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Events</h3>
                    <p className="text-gray-600">Support Pride celebrations, educational forums, and community-building events throughout the year.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🤝</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Advocacy & Support</h3>
                    <p className="text-gray-600">Fund advocacy efforts, crisis support, and programs that protect and empower our community.</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Ways to Give</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• One-time donations</li>
                  <li>• Monthly recurring support</li>
                  <li>• Corporate sponsorships</li>
                  <li>• In-kind donations</li>
                  <li>• Planned giving</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Donation Levels</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-800">🌟 Rainbow Supporter</span>
                    <span className="font-semibold text-purple-900">$1-24/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">🌈 Pride Champion</span>
                    <span className="font-semibold text-purple-900">$25-99/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800">💎 Community Builder</span>
                    <span className="font-semibold text-purple-900">$100+/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Form */}
            <div>
              <CRMContactForm type="donor" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

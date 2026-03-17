import CRMContactForm from '@/components/CRMContactForm';

export default function VolunteerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Volunteer with Katy Pride
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mb-8">
            Join our amazing team of volunteers and help make a difference in the Katy LGBTQ+ community. 
            Whether you have a few hours a month or want to take on a leadership role, we have opportunities 
            for everyone to contribute their skills and passion.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Volunteer Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-purple-600">Why Volunteer?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🤝</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Make a Direct Impact</h3>
                    <p className="text-gray-600">Help create safe spaces and support for LGBTQ+ individuals and families in Katy.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🌈</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Build Community</h3>
                    <p className="text-gray-600">Connect with like-minded individuals and be part of a supportive, inclusive community.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">💪</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Develop Skills</h3>
                    <p className="text-gray-600">Gain valuable experience in event planning, community organizing, and advocacy.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="text-purple-600 text-xl">🎉</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Have Fun!</h3>
                    <p className="text-gray-600">Be part of amazing events and celebrations that bring joy and visibility to our community.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">Volunteer Opportunities</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Event Planning & Coordination</li>
                  <li>• Community Outreach & Education</li>
                  <li>• Youth Program Support</li>
                  <li>• Fundraising & Grant Writing</li>
                  <li>• Social Media & Communications</li>
                  <li>• Administrative Support</li>
                  <li>• Mentorship Programs</li>
                  <li>• Healthcare & Wellness Support</li>
                </ul>
              </div>
            </div>

            {/* Volunteer Form */}
            <div>
              <CRMContactForm type="volunteer" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

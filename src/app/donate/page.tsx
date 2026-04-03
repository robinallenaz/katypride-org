import TwoStepDonationForm from '@/components/TwoStepDonationForm';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Making a Donation to Katy Pride
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Support Love and Equality in Every Color!
          </h2>
          
          <div className="text-lg text-gray-700 leading-relaxed max-w-4xl mb-8">
            <p className="mb-4">
              At Katy Pride, we believe in a world where everyone has the freedom to be themselves, regardless of their gender identity or sexual orientation. Our mission is to empower, celebrate, and support the LGBTQ+ community in Katy and beyond, creating a vibrant tapestry of love, acceptance, and pride.
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Your Contribution Matters</h3>
            <p className="text-gray-700 mb-4">
              Every donation, no matter the size, plays a crucial role in our journey towards a more inclusive society. Here's how your generosity makes a difference:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <h4 className="font-semibold text-purple-700 mb-2">Community Outreach and Support</h4>
                <p className="text-sm text-gray-600">
                  Funding local events, educational programs, and support groups that bring our community together.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">📢</div>
                <h4 className="font-semibold text-purple-700 mb-2">Advocacy and Awareness</h4>
                <p className="text-sm text-gray-600">
                  Promoting LGBTQ+ rights and creating a platform for voices that need to be heard.
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <h4 className="font-semibold text-purple-700 mb-2">Youth Empowerment</h4>
                <p className="text-sm text-gray-600">
                  Offering resources and safe spaces for young LGBTQ+ individuals to thrive.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-purple-700 mb-4">Ways to Donate</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="text-purple-600 text-xl">💝</div>
                <div>
                  <h4 className="font-semibold text-gray-900">One-Time Donation</h4>
                  <p className="text-gray-600">Every single contribution brings us closer to our goals. You can make a one-time donation using our secure online system.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="text-purple-600 text-xl">🔄</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Monthly Supporter</h4>
                  <p className="text-gray-600">Become a pillar in our community by setting up a recurring monthly donation. This steady support helps us plan long-term initiatives and projects.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Step Donation Form */}
          <TwoStepDonationForm />

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-purple-700 mb-4">Contact Us</h3>
              <p className="text-gray-700 mb-2">
                <strong>Contact Us!</strong>
              </p>
              <div className="space-y-2">
                <a 
                  href="mailto:info@katypride.org" 
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  info@katypride.org
                </a>
                <div className="text-purple-600 font-medium">
                  346-202-5289 - Call or Text
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-4">
                <a 
                  href="https://www.instagram.com/katypridelgbtq" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Instagram
                </a>
                <a 
                  href="https://www.facebook.com/katyprielgbtq" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

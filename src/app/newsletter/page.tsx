import NewsletterForm from '@/components/NewsletterForm';
import { Calendar, Users, Megaphone, Heart, Flag, Lock, Mail, Camera, Building } from 'lucide-react';

export default function NewsletterPage() {
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#760088] text-white px-4 py-2 rounded-md font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
        <section id="main-content" className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
              Stay Connected
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Katy Pride Newsletter
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Join our community and stay informed about upcoming events, volunteer opportunities, advocacy efforts, and ways to support LGBTQ+ inclusion in Katy and West Houston.
            </p>
          </div>

          {/* What You'll Receive Section */}
          <div className="mb-12">
            <h3 className="font-heading text-2xl font-bold text-[#760088] mb-6 text-center">What You'll Receive</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Event Updates</h4>
                <p className="text-gray-700 text-sm">Be the first to know about Pride celebrations, monthly coffee meet-ups, socials, and community events.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Volunteer Opportunities</h4>
                <p className="text-gray-700 text-sm">Get involved with meaningful opportunities to support our community and make a difference.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Megaphone className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Advocacy News</h4>
                <p className="text-gray-700 text-sm">Stay informed about important issues affecting the LGBTQ+ community in Katy and Texas.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Ways to Support</h4>
                <p className="text-gray-700 text-sm">Learn about donation opportunities, sponsorships, and other ways to support our mission.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Flag className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Community Stories</h4>
                <p className="text-gray-700 text-sm">Read inspiring stories from community members and see the impact of your support.</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-purple-700" />
                </div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-2">Partnership News</h4>
                <p className="text-gray-700 text-sm">Learn about our collaborations with other LGBTQ+ organizations and community allies.</p>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="mb-12">
            <NewsletterForm />
          </div>

          {/* Our Commitment Section */}
          <div className="bg-purple-50 rounded-xl p-8 border border-purple-100">
            <h3 className="font-heading text-2xl font-bold text-[#760088] mb-6 text-center">Our Commitment to You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Your Privacy Matters
                </h4>
                <p className="text-gray-700 text-sm mb-4">
                  We respect your privacy and will never share your personal information with third parties without your consent. Your data is stored securely and used only to communicate about Katy Pride activities.
                </p>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  No Spam, Just Value
                </h4>
                <p className="text-gray-700 text-sm">
                  We send thoughtful, relevant updates typically 2-4 times per month. You can unsubscribe at any time with a single click - no questions asked.
                </p>
              </div>
              <div>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Building Community Together
                </h4>
                <p className="text-gray-700 text-sm mb-4">
                  By joining our newsletter, you become part of a growing movement to create a more inclusive, accepting, and supportive community for LGBTQ+ individuals and allies in Katy and West Houston.
                </p>
                <h4 className="font-heading text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Making an Impact
                </h4>
                <p className="text-gray-700 text-sm">
                  Your engagement helps us reach more people, organize bigger events, and provide greater support to our community. Together, we're creating lasting change.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-12">
            <h3 className="font-heading text-xl font-bold text-[#760088] mb-4">Have Questions?</h3>
            <p className="text-gray-700 mb-4">
              We'd love to hear from you! Reach out to us at any time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:info@katypride.org" 
                className="inline-flex items-center justify-center bg-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-purple-700 transition-colors gap-2"
              >
                <Mail className="w-4 h-4" />
                info@katypride.org
              </a>
              <a 
                href="https://www.instagram.com/katyprielgbtq" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors gap-2"
              >
                <Camera className="w-4 h-4" />
                @KatyPrideLGBTQ
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

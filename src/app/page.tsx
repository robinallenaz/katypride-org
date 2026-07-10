import Carousel from "@/components/Carousel";
import { Check, Shield, Users, Calendar, Heart, ArrowRight, MapPin } from "lucide-react";

// Chase the Rainbow 5K happened on 2026-06-13. Set to true to show it again next year.
const SHOW_5K: boolean = false;

export default function Home() {
  return (
    <>
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#760088] text-white px-4 py-2 rounded-md font-semibold z-50"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <header className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10">
            <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
              Welcome to Katy Pride
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering the LGBTQ+ community in Katy and West Houston by creating inclusive events, advocating for equality, and fostering a supportive community of acceptance and diversity.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-center">
              <a
                href="/donate"
                className="font-heading inline-flex min-w-[200px] sm:min-w-[240px] flex-col items-center justify-center rounded-full bg-[#760088] px-6 sm:px-7 py-3 font-semibold text-white shadow-md transition-all hover:bg-[#5a0666] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm sm:text-base"
              >
                <span>Make a Donation</span>
                <span className="mt-0.5 text-xs sm:text-sm font-normal text-white/90">Support our mission</span>
              </a>
              {SHOW_5K && (
              <a
                href="https://raceroster.com/events/2026/116853/chase-the-rainbow-stride-with-pride/volunteer/register"
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading inline-flex min-w-[200px] sm:min-w-[240px] flex-col items-center justify-center rounded-full bg-[#06bd01] text-white border border-[#06bd01] px-6 sm:px-7 py-3 font-semibold transition-all hover:bg-[#05a801] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06bd01] focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm sm:text-base shadow-md"
              >
                <span>Katy Pride 5K</span>
                <span className="mt-0.5 text-xs sm:text-sm font-normal text-white/90">Register or Volunteer</span>
              </a>
              )}
              <a
                href="/celebration"
                className="font-heading inline-flex min-w-[200px] sm:min-w-[240px] flex-col items-center justify-center rounded-full border-2 border-[#760088] text-[#760088] px-6 sm:px-7 py-3 font-semibold transition-all hover:bg-[#760088] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white text-sm sm:text-base"
              >
                <span>Vendor or Sponsor</span>
                <span className="mt-0.5 text-xs sm:text-sm font-normal opacity-80">Join our celebration</span>
              </a>
              <a
                href="/newsletter"
                className="font-heading inline-flex items-center justify-center text-[#760088] px-3 sm:px-4 py-2 font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-underline text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Stay in the Know!</span>
                <span className="sm:hidden">Newsletter</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </header>

        {/* Carousel Section */}
        <section aria-label="Photo Gallery" role="region" className="relative z-10 max-w-6xl mx-auto px-4 mb-6 md:mb-8">
          <Carousel />
        </section>

        {/* Banner Image Section */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 mb-6 md:mb-8">
          <a
            href="/donate"
            className="block relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r from-[#760088] via-purple-600 to-indigo-600 hover:shadow-2xl transition-shadow group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#760088]/90 via-purple-600/90 to-indigo-600/90"></div>
            <div className="relative px-6 py-8 md:py-10 text-center">
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Donate to Katy Pride
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-4 max-w-xl mx-auto">
                Your support helps us create inclusive events and advocate for equality in Katy and West Houston
              </p>
              <span className="inline-flex items-center justify-center bg-white text-[#760088] px-6 py-2.5 rounded-full font-semibold text-sm md:text-base group-hover:bg-white/90 transition-colors">
                Make a Donation
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </a>
        </section>

        <main id="main-content" className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* About Katy Pride Section */}
          <section aria-label="About Katy Pride" className="mb-8 md:mb-12">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-purple-100/20">
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                <div>
                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
                    Building Community Since 2023
                  </h2>
                  <p className="text-base sm:text-lg text-gray-800 mb-4 md:mb-6 leading-relaxed">
                    We're creating a safe, inclusive space for LGBTQ+ individuals and allies in Katy and West Houston through community events, advocacy, and support programs.
                  </p>
                  <div className="space-y-2 sm:space-y-3 mb-4 md:mb-6" role="list">
                    <div className="flex items-center gap-2 sm:gap-3" role="listitem">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#06bd01] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 font-medium">2,000+ community members served</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3" role="listitem">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#ff1c25] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 font-medium">12+ annual events</span>
                    </div>
                  </div>
                  <a
                    href="/volunteer"
                    className="inline-flex items-center justify-center bg-[#760088] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium hover:bg-[#5a0666] transition-colors text-sm sm:text-base"
                  >
                    Volunteer with Us
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-6 md:p-8 text-center border border-purple-100/20">
                    <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-3 md:mb-4">
                      <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium text-base md:text-lg">"Empowering the LGBTQ+ community in Katy and West Houston by creating inclusive events, advocating for equality, and fostering a supportive community of acceptance and diversity."</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Get Involved Section */}
          <section aria-label="Get Involved" className="mb-8 md:mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 md:mb-8 text-center">Get Involved</h2>
            <div className="grid md:grid-cols-3 gap-4 md:gap-8">
              <article className="group relative">
                <a href="/events" className="absolute inset-0 z-10" aria-label="Learn about Katy Pride Events and community gatherings"></a>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#06bd01] group-hover:border-[#08e508] h-full">
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#06bd01] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-[#06bd01]">Events</h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-800">Join us for community events, workshops, and celebrations throughout the year.</p>
                </div>
              </article>
              <article className="group relative">
                <a href="/advocacy" className="absolute inset-0 z-10" aria-label="Learn about Katy Pride Advocacy and equality initiatives"></a>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#ff1c25] group-hover:border-[#ff3d4d] h-full">
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#ff1c25] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-[#ff1c25]">Advocacy</h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-800">Help us advance equality and inclusion through education and outreach.</p>
                </div>
              </article>
              <article className="group relative">
                <a href="/resources" className="absolute inset-0 z-10" aria-label="Access LGBTQ+ Resources and support services"></a>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#760088] group-hover:border-[#8a0aa8] h-full">
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#760088] rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-[#760088]">Resources</h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-800">Access support, information, and connections to local and national organizations.</p>
                </div>
              </article>
            </div>
          </section>

          {/* Upcoming Events Section */}
          {SHOW_5K && (
          <section aria-label="Upcoming Events" className="mb-8 md:mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-medium text-gray-900 mb-6 md:mb-8 text-center">Upcoming Events</h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#fdf4ff] rounded-[20px] p-6 md:p-10 text-center relative overflow-hidden border border-purple-100/20 shadow-xl">
                {/* Rainbow Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E24B4A] via-[#EF9F27] via-[#63AD22] via-[#378ADD] via-[#7F77DD] to-[#D4537E] rounded-t-[20px]"></div>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-[#760088] rounded-full mb-3 md:mb-4 mt-2">
                  <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-2">
                  Chase the Rainbow 5K
                </h2>
                <p className="text-sm font-medium text-[#444441] mb-1">
                  Saturday, June 13, 2026 • John Paul Landing Park, Katy TX
                </p>
                <p className="text-sm text-[#5F5E5A] mb-5 md:mb-7 max-w-2xl mx-auto">
                  Run, walk, or stride with pride — celebrating the Katy LGBTQ+ community.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5 md:mb-7">
                  <a
                    href="https://raceroster.com/events/2026/116853/chase-the-rainbow-stride-with-pride"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-[#760088] text-white px-6 md:px-7 py-3 rounded-full font-medium text-sm hover:bg-[#5a0666] transition-colors gap-2"
                  >
                    <span>Register for the 5K</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  
                  <a
                    href="/5k"
                    className="inline-flex items-center justify-center bg-white text-[#760088] border border-purple-100/50 px-6 md:px-7 py-3 rounded-full font-medium text-sm hover:bg-[#EEEDFE] transition-colors"
                  >
                    Become a Sponsor
                  </a>
                </div>
                
                {/* Sponsorship Tiers */}
                <div className="bg-white border border-purple-100/20 rounded-[12px] p-3 md:p-4 text-left">
                  <p className="text-xs font-medium text-[#888780] uppercase tracking-wider mb-2 md:mb-3">
                    Sponsorship levels
                  </p>
                  <div className="grid grid-cols-5 gap-2 md:gap-4">
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#B4B2A9]" aria-hidden="true"></div>
                      <span className="text-xs font-medium text-[#444441] text-center">Community</span>
                      <span className="text-xs text-[#888780] font-bold">$100</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#CE9A5A]" aria-hidden="true"></div>
                      <span className="text-xs font-medium text-[#444441] text-center">Bronze</span>
                      <span className="text-xs text-[#888780] font-bold">$250</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#888780]" aria-hidden="true"></div>
                      <span className="text-xs font-medium text-[#444441] text-center">Silver</span>
                      <span className="text-xs text-[#888780] font-bold">$500</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#BA7517]" aria-hidden="true"></div>
                      <span className="text-xs font-medium text-[#444441] text-center">Gold</span>
                      <span className="text-xs text-[#888780] font-bold">$1,000</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#760088]" aria-hidden="true"></div>
                      <span className="text-xs font-medium text-[#444441] text-center">Presenting</span>
                      <span className="text-xs text-[#888780] font-bold">$2,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}
        </main>
      </div>
    </>
  );
}

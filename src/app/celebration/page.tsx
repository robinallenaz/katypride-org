export default function CelebrationPage() {
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            Katy Pride Celebration
          </h1>
          <div className="text-lg text-gray-800 leading-relaxed max-w-3xl">
            <div className="space-y-6">
              <p>
                Join us for the Katy Pride 2026 Celebration on Saturday, October 3, 2026 from 11AM to 4PM at the Bear Creek Rodeo Arena in Houston, Texas. This year&apos;s theme &quot;STAND TALL, Y&apos;ALL!&quot; celebrates the strength, resilience, and vibrant diversity of our LGBTQ+ community in Katy and West Houston.
              </p>
              <p>
                Expected to draw 2,000+ attendees, our annual celebration is the cornerstone of Katy Pride&apos;s mission to empower LGBTQ+ individuals and allies through inclusive events, advocacy, and community building. Serving Katy, Harris, Fort Bend, and Waller counties, we&apos;re creating safe spaces where everyone can live authentically and proudly.
              </p>
              <p>
                The celebration features 70+ vendor booths, live entertainment, community resources, family-friendly activities, and opportunities to connect with local LGBTQ+ organizations and allies. Whether you&apos;re looking to celebrate, volunteer, or simply show your support, the Katy Pride Celebration is where our community comes together to stand tall, speak out, and build a more inclusive future for all.
              </p>
            </div>
          </div>

          {/* Vendor & Sponsor Links */}
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="/sponsor-celebration"
              className="inline-flex items-center gap-2 bg-[#760088] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#5a0666] transition-colors"
            >
              Become a Sponsor
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="/vendor-signup"
              className="inline-flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-purple-700 transition-colors"
            >
              2026 Vendor Application
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <a
              href="/sponsorship-packet.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border-2 border-[#760088] text-[#760088] font-semibold px-6 py-3 rounded-full hover:bg-purple-50 transition-colors"
            >
              View Sponsorship Packet (PDF)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100/20 shadow-xl p-8 md:p-10 mt-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-6 text-center">
            Celebration Photos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative rounded-xl overflow-hidden shadow-md aspect-[3/4]">
              <img
                src="/carousel/3-Attendees-At-Celebration.jpg"
                alt="Attendees at Katy Pride Celebration"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-md aspect-[3/4]">
              <img
                src="/carousel/DJ-Krazy-V.jpg"
                alt="DJ Krazy V at Katy Pride"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative rounded-xl overflow-hidden shadow-md aspect-[3/4]">
              <img
                src="/carousel/katy-pride-volunteers.jpg"
                alt="Katy Pride Volunteers"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* 2026 Sponsors */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 mt-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#760088] mb-8 text-center">
            Katy Pride 2025 Sponsors
          </h2>

          {/* Platinum Sponsor */}
          <div className="mb-10 text-center">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#760088] mb-3">
              Platinum Sponsors
            </h3>
            <p className="text-gray-700 text-xl font-semibold">First Christian Church Katy</p>
          </div>

          {/* Silver Sponsors */}
          <div className="mb-8">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#760088] mb-3">
              Silver Sponsors
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
              <li>The American Silver Museum</li>
              <li>SOMOS Loud - AIDS Healthcare Foundation</li>
              <li>Jon Rosenthal for Texas Campaign</li>
            </ul>
          </div>

          {/* Rainbow Sponsors */}
          <div className="mb-8">
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#760088] mb-3">
              Rainbow Sponsors
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
              <li>Mirus High School</li>
              <li>Anne Russey Counseling</li>
              <li>Katy Area Democrats</li>
              <li>The Healing Place, PLLC</li>
              <li>The Toasted Yolk Cafe</li>
              <li>Your Total Foot Care Specialist</li>
              <li>New Hope Lutheran Church</li>
            </ul>
          </div>

          {/* Friends of Katy Pride */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-[#760088] mb-3">
              Friends of Katy Pride
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
              <li>Stacy Maag</li>
              <li>Dr. Eliz Markowitz for Texas HD 26</li>
              <li>Sara McGee for Texas</li>
              <li>Tana Weiss</li>
              <li>Chromatic Life Counseling - Bradley Gowers</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}

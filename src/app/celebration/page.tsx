import { strapiClient, type StrapiPageContent } from '@/lib/strapi'
import StrapiRichText from '@/components/StrapiRichText'

export const dynamic = 'force-dynamic'

interface PageContent {
  heading?: string
  intro?: any[]
}

async function getPageContent(page: string): Promise<PageContent | null> {
  try {
    const strapiContent = await strapiClient.getPageContent(page)
    
    if (!strapiContent) return null
    
    return {
      heading: strapiContent.heading,
      intro: strapiContent.intro
    }
  } catch (error) {
    console.error('Failed to fetch page content:', error)
    return null
  }
}

export default async function CelebrationPage() {
  const pageContent = await getPageContent('celebration')

  const heading = pageContent?.heading || 'Katy Pride Celebration'
  const intro = pageContent?.intro

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
            {heading}
          </h1>
          <div className="text-lg text-gray-800 leading-relaxed max-w-3xl">
            {intro ? (
              <StrapiRichText content={intro} />
            ) : (
              <div className="space-y-6">
                <p>
                  Join us for the Katy Pride 2026 Celebration on Saturday, October 3, 2026 from 11AM to 4PM at the Bear Creek Rodeo Arena in Houston, Texas. This year's theme "STAND TALL, Y'ALL!" celebrates the strength, resilience, and vibrant diversity of our LGBTQ+ community in Katy and West Houston.
                </p>
                <p>
                  Expected to draw 2,000+ attendees, our annual celebration is the cornerstone of Katy Pride's mission to empower LGBTQ+ individuals and allies through inclusive events, advocacy, and community building. Serving Katy, Harris, Fort Bend, and Waller counties, we're creating safe spaces where everyone can live authentically and proudly.
                </p>
                <p>
                  The celebration features 70+ vendor booths, live entertainment, community resources, family-friendly activities, and opportunities to connect with local LGBTQ+ organizations and allies. Whether you're looking to celebrate, volunteer, or simply show your support, the Katy Pride Celebration is where our community comes together to stand tall, speak out, and build a more inclusive future for all.
                </p>
              </div>
            )}
          </div>

          {/* Vendor Application Link */}
          <div className="mt-6 flex flex-wrap gap-4">
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

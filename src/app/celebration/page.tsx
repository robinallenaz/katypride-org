import { client } from '@/sanity/lib/client'

interface FormLink {
  _id: string
  title: string
  url: string
}

interface PageContent {
  heading?: string
  intro?: string
}

async function getFormLinks(): Promise<FormLink[]> {
  return client.fetch(
    `*[_type == "formLink" && page == "celebration" && active == true] | order(orderRank asc) {
      _id,
      title,
      url
    }`
  )
}

async function getPageContent(): Promise<PageContent | null> {
  return client.fetch(
    `*[_type == "pageContent" && page == "celebration"][0] {
      heading,
      intro
    }`
  )
}

export default async function CelebrationPage() {
  const [formLinks, pageContent] = await Promise.all([getFormLinks(), getPageContent()])

  const heading = pageContent?.heading || 'Celebration'
  const intro = pageContent?.intro || 'This page is a placeholder. Details for Katy Pride Celebration will live here.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            {heading}
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
            {intro}
          </p>

          {/* Form Links */}
          {formLinks.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              {formLinks.map((link) => (
                <a
                  key={link._id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#760088] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#5a0066] transition-colors"
                >
                  {link.title}
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
              ))}
            </div>
          )}
        </div>

        {/* 2025 Sponsors */}
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
  )
}

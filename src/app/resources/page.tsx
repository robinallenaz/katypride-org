import { strapiClient, type StrapiResourceLink } from '@/lib/strapi'

export const dynamic = 'force-dynamic'

interface ResourceLink {
  id: string
  title: string
  url: string
  category: string
}

type Accent = {
  cardBg: string
  cardHoverBg: string
  cardBorder: string
  cardHoverBorder: string
  stripe: string
  ring: string
  pillBorder: string
  pillBg: string
  pillHoverBg: string
  pillText: string
  chipBorder: string
  chipBg: string
  chipHoverBg: string
  chipText: string
}

const defaultResources: ResourceLink[] = [
  { id: 'h1', title: 'AHF Pharmacy', url: 'https://ahfpharmacy.org/', category: 'health' },
  { id: 'h2', title: 'Houston Wellness Center (AHF)', url: 'https://locations.aidshealth.org/tx-houston-wellness18-25', category: 'health' },
  { id: 'h3', title: 'Avenue 360', url: 'https://avenue360.org/', category: 'health' },
  { id: 'h4', title: 'BWell Counseling Center', url: 'https://www.bwellcounselingcenter.com/', category: 'health' },
  { id: 'h5', title: 'Fort Bend County HHS', url: 'https://www.fortbendcountytx.gov/government/departments/health-and-human-services', category: 'health' },
  { id: 'h6', title: 'Legacy Community Health', url: 'https://www.legacycommunityhealth.org/', category: 'health' },
  { id: 'h7', title: 'SBCHC', url: 'https://sbchc.net/', category: 'health' },
  { id: 'h8', title: 'VADA Counseling', url: 'https://www.vadacounseling.com/', category: 'health' },
  { id: 'h9', title: 'West Houston Counseling', url: 'https://westhoustoncounseling.com/', category: 'health' },
  { id: 'a1', title: 'ACLU Texas', url: 'https://www.aclutx.org/', category: 'advocacy' },
  { id: 'a2', title: 'Equality Texas', url: 'https://www.equalitytexas.org/', category: 'advocacy' },
  { id: 'a3', title: 'League of Women Voters (Fort Bend)', url: 'https://www.lwv.org/local-leagues/lwv-fort-bend', category: 'advocacy' },
  { id: 'a4', title: 'Lone Star Legal Aid', url: 'https://www.lonestarlegal.org/', category: 'advocacy' },
  { id: 'a5', title: 'Somos Loud', url: 'https://somosloud.org/', category: 'advocacy' },
  { id: 'a6', title: 'Students Engaged in Advancing Texas', url: 'https://www.studentsengaged.org/', category: 'advocacy' },
  { id: 'a7', title: 'Trans Texas', url: 'https://www.transtexas.org/', category: 'advocacy' },
  { id: 'a8', title: 'Trans Legal Aid TX', url: 'https://translegalaidtx.com/', category: 'advocacy' },
  { id: 'a9', title: 'Veterans for Equality', url: 'https://veteransforequality.org/', category: 'advocacy' },
  { id: 'l1', title: 'First Christian Church Katy', url: 'https://www.fcckaty.com/', category: 'ally' },
  { id: 'l2', title: 'Hatch Youth', url: 'https://montrosecenter.org/micro-sites/hatch-youth/', category: 'ally' },
  { id: 'l3', title: 'Houston LGBTQ+ Chamber of Commerce', url: 'https://www.houstonlgbtchamber.com/', category: 'ally' },
  { id: 'l4', title: 'K-PLACE', url: 'https://fcckaty.org/kplace/', category: 'ally' },
  { id: 'l5', title: 'Mirus High School - LGBTQ+ Affirming School (8th-12th)', url: 'https://www.mirus-academy.org/', category: 'ally' },
  { id: 'l6', title: 'Montrose Center', url: 'https://montrosecenter.org/', category: 'ally' },
  { id: 'l7', title: 'Out for Education', url: 'https://outforeducation.org/', category: 'ally' },
  { id: 'l8', title: 'Parents of Trans Youth', url: 'https://www.parentsoftransyouth.com/', category: 'ally' },
  { id: 'l9', title: 'PFLAG Houston', url: 'https://www.pflaghouston.org/', category: 'ally' },
  { id: 'l10', title: 'The Normal Anomaly Initiative, Inc.', url: 'https://www.normalanomaly.org/', category: 'ally' },
  { id: 'l11', title: "Tony's Place", url: 'https://tonysplace.org/', category: 'ally' },
  { id: 'l12', title: 'Trans Masculine Alliance Houston', url: 'https://transmasculinehouston.com/', category: 'ally' },
  { id: 'l13', title: 'Transparent Closet', url: 'https://fcckaty.org/transparent-closet/', category: 'ally' },
  { id: 'r1', title: 'Brazoria County Pride', url: 'https://www.brazoriacountypride.com/', category: 'regional' },
  { id: 'r2', title: 'Columbus Pride', url: 'https://www.columbustxpride.com/', category: 'regional' },
  { id: 'r3', title: 'Fort Bend County Pride', url: 'https://www.fortbendcountypride.org/', category: 'regional' },
  { id: 'r4', title: 'Pride Galveston', url: 'https://pridegalveston.com/', category: 'regional' },
  { id: 'r5', title: 'New Faces of Pride', url: 'https://newfacesofpride.org/', category: 'regional' },
  { id: 'r6', title: 'Pride Houston', url: 'https://pridehouston365.org/', category: 'regional' },
  { id: 'r7', title: 'The Woodlands Pride', url: 'https://www.thewoodlandspride.org/', category: 'regional' },
  { id: 'r8', title: 'Third Coast Pride', url: 'https://gaygalveston.com/', category: 'regional' },
  { id: 'n1', title: 'ACLU (American Civil Liberties Union)', url: 'https://www.aclu.org/', category: 'national' },
  { id: 'n2', title: 'AHF (Aids Healthcare Foundation)', url: 'https://ahf.org/', category: 'national' },
  { id: 'n3', title: 'AHF Pharmacy', url: 'https://ahfpharmacy.org/', category: 'national' },
  { id: 'n4', title: 'Glaad', url: 'https://glaad.org/', category: 'national' },
  { id: 'n5', title: 'GLSEN', url: 'https://www.glsen.org/', category: 'national' },
  { id: 'n6', title: 'Human Rights Campaign', url: 'https://www.hrc.org/', category: 'national' },
  { id: 'n7', title: 'It Gets Better Project', url: 'https://itgetsbetter.org/', category: 'national' },
  { id: 'n8', title: 'Lambda Legal', url: 'https://lambdalegal.org/', category: 'national' },
  { id: 'n9', title: 'PFLAG', url: 'https://pflag.org/', category: 'national' },
  { id: 'n10', title: 'Planned Parenthood', url: 'https://www.plannedparenthood.org/', category: 'national' },
  { id: 'n11', title: 'Trans Lifeline', url: 'https://translifeline.org/', category: 'national' },
  { id: 'n12', title: 'Trevor Project', url: 'https://www.thetrevorproject.org/', category: 'national' },
]

async function getResourceLinks(): Promise<ResourceLink[]> {
  try {
    const strapiResources = await strapiClient.getResourceLinks()
    
    // Convert Strapi resources to expected format
    const convertedResources = strapiResources.map((resource) => ({
      id: resource.documentId,
      title: resource.name,
      url: resource.url,
      category: resource.category
    }))
    
    // Merge with default resources - Strapi resources appear first, then defaults
    // Use a Set to track URLs and avoid duplicates
    const seenUrls = new Set(convertedResources.map((r) => r.url))
    const uniqueDefaults = defaultResources.filter((r) => !seenUrls.has(r.url))
    return [...convertedResources, ...uniqueDefaults]
  } catch (error) {
    console.error('Failed to fetch resource links:', error)
    // Return default resources if Strapi fails
    return defaultResources
  }
}

export default async function ResourcesPage() {
  const resources = await getResourceLinks()

  const healthResources = resources.filter((r) => r.category === 'health')
  const advocacyResources = resources.filter((r) => r.category === 'advocacy')
  const allyResources = resources.filter((r) => r.category === 'ally')
  const regionalResources = resources.filter((r) => r.category === 'regional')
  const nationalResources = resources.filter((r) => r.category === 'national')

  const getHostname = (href: string) => {
    try {
      return new URL(href).hostname.replace(/^www\./, "")
    } catch {
      return href
    }
  }

  const accents: Record<string, Accent> = {
    health: {
      cardBg: "bg-white/90",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-gray-200",
      cardHoverBorder: "hover:border-[#06bd01]/50",
      stripe: "border-l-[#06bd01]",
      ring: "focus-visible:ring-[#06bd01]",
      pillBorder: "border-[#06bd01]/30",
      pillBg: "bg-[#06bd01]/10",
      pillHoverBg: "group-hover:bg-[#06bd01]/20",
      pillText: "text-[#025200]",
      chipBorder: "border-[#06bd01]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#06bd01]/10",
      chipText: "text-[#025200]",
    },
    advocacy: {
      cardBg: "bg-white/90",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-gray-200",
      cardHoverBorder: "hover:border-[#ff1c25]/50",
      stripe: "border-l-[#ff1c25]",
      ring: "focus-visible:ring-[#ff1c25]",
      pillBorder: "border-[#ff1c25]/30",
      pillBg: "bg-[#ff1c25]/10",
      pillHoverBg: "group-hover:bg-[#ff1c25]/20",
      pillText: "text-[#800000]",
      chipBorder: "border-[#ff1c25]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#ff1c25]/10",
      chipText: "text-[#800000]",
    },
    ally: {
      cardBg: "bg-white/90",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-gray-200",
      cardHoverBorder: "hover:border-[#760088]/50",
      stripe: "border-l-[#760088]",
      ring: "focus-visible:ring-[#760088]",
      pillBorder: "border-[#760088]/30",
      pillBg: "bg-[#760088]/10",
      pillHoverBg: "group-hover:bg-[#760088]/20",
      pillText: "text-[#5a0066]",
      chipBorder: "border-[#760088]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#760088]/10",
      chipText: "text-[#5a0066]",
    },
    regional: {
      cardBg: "bg-white/90",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-gray-200",
      cardHoverBorder: "hover:border-[#fe931f]/50",
      stripe: "border-l-[#fe931f]",
      ring: "focus-visible:ring-[#fe931f]",
      pillBorder: "border-[#fe931f]/30",
      pillBg: "bg-[#fe931f]/10",
      pillHoverBg: "group-hover:bg-[#fe931f]/20",
      pillText: "text-[#804000]",
      chipBorder: "border-[#fe931f]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#fe931f]/10",
      chipText: "text-[#804000]",
    },
    national: {
      cardBg: "bg-white/90",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-gray-200",
      cardHoverBorder: "hover:border-[#021999]/50",
      stripe: "border-l-[#021999]",
      ring: "focus-visible:ring-[#021999]",
      pillBorder: "border-[#021999]/30",
      pillBg: "bg-[#021999]/10",
      pillHoverBg: "group-hover:bg-[#021999]/20",
      pillText: "text-[#001566]",
      chipBorder: "border-[#021999]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#021999]/10",
      chipText: "text-[#001566]",
    },
  }

  const JumpLink = ({
    href,
    label,
    accent,
  }: {
    href: string
    label: string
    accent: Accent
  }) => (
    <a
      href={href}
      role="tab"
      className={`font-heading antialiased inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-[13px] font-semibold leading-none tracking-wide shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${accent.chipBorder} ${accent.chipBg} ${accent.chipHoverBg} ${accent.chipText} ${accent.ring}`}
    >
      {label}
    </a>
  )

  const LinkItem = ({
    title,
    href,
    accent,
  }: {
    title: string
    href: string
    accent: Accent
  }) => (
    <li className="h-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${title} — Visit website (opens in a new tab)`}
        className={`group flex h-full items-start justify-between gap-4 rounded-2xl border border-l-4 px-4 py-4 shadow transition focus-visible:outline-none focus-visible:ring-2 ${accent.cardBg} ${accent.cardHoverBg} ${accent.cardBorder} ${accent.cardHoverBorder} ${accent.stripe} ${accent.ring}`}
      >
        <span className="min-w-0">
          <span className="font-heading text-lg text-gray-900 group-hover:text-purple-950 group-hover:underline decoration-purple-300 underline-offset-4">
            {title}
          </span>
          <span className="mt-1 block text-sm text-gray-600 break-words" title={href}>
            {getHostname(href)}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`font-heading antialiased mt-0.5 shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold leading-none tracking-wide transition-all duration-200 ${accent.pillBorder} ${accent.pillBg} ${accent.pillText} ${accent.pillHoverBg}`}
        >
          Visit <span aria-hidden="true">→</span>
        </span>
      </a>
    </li>
  )

  const BackToCategories = () => (
    <a
      href="#categories"
      className="inline-flex items-center gap-1.5 text-sm text-[#760088] hover:text-[#5a0066] font-medium mt-4 transition-colors"
    >
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
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
      Back to categories
    </a>
  )

  const Section = ({
    title,
    items,
    id,
    accent,
  }: {
    title: string
    items: Array<{ id: string; title: string; url: string }>
    id: string
    accent: Accent
  }) => (
    <section id={id} className="mt-10 scroll-mt-24">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-4">
        {title}
      </h2>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <LinkItem
            key={item.id}
            title={item.title}
            href={item.url}
            accent={accent}
          />
        ))}
      </ul>
      <BackToCategories />
    </section>
  )

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
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            LGBTQ Local & National Resources
          </h1>

          <p className="text-lg text-gray-800 leading-relaxed max-w-3xl">
            Community resources and support links.
          </p>

          <nav id="categories" aria-label="Resource categories" className="mt-6 scroll-mt-24">
            <p className="text-sm text-gray-700 mb-3" id="category-description">
              Select a category to jump to that section.
            </p>
            <div className="grid gap-2 sm:flex sm:flex-wrap" role="tablist" aria-describedby="category-description">
              <JumpLink
                href="#health-and-wellness"
                label="Health & Wellness"
                accent={accents.health}
              />
              <JumpLink
                href="#lgbtq-advocacy"
                label="LGBTQ Advocacy"
                accent={accents.advocacy}
              />
              <JumpLink
                href="#lgbtq-and-ally"
                label="LGBTQ & Ally"
                accent={accents.ally}
              />
              <JumpLink
                href="#regional-pride"
                label="Regional"
                accent={accents.regional}
              />
              <JumpLink
                href="#national-resources"
                label="National"
                accent={accents.national}
              />
            </div>
          </nav>

          <Section
            title="Health and Wellness Resources"
            id="health-and-wellness"
            accent={accents.health}
            items={healthResources}
          />

          <Section
            title="LGBTQ Advocacy Resources"
            id="lgbtq-advocacy"
            accent={accents.advocacy}
            items={advocacyResources}
          />

          <Section
            title="LGBTQ & Ally Resources"
            id="lgbtq-and-ally"
            accent={accents.ally}
            items={allyResources}
          />

          <Section
            title="Regional Pride Resources"
            id="regional-pride"
            accent={accents.regional}
            items={regionalResources}
          />

          <Section
            title="National LGBTQ Resources"
            id="national-resources"
            accent={accents.national}
            items={nationalResources}
          />
        </div>
      </section>
    </div>
    </>
  )
}

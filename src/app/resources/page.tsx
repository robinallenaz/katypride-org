import { client } from '@/sanity/lib/client'
import { PreviewBanner } from '@/components/PreviewBanner'
import { isPreviewMode, getDraftContent } from '@/lib/preview'

interface ResourceLink {
  _id: string
  name: string
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
  { _id: 'h1', name: 'AHF Pharmacy', url: 'https://ahfpharmacy.org/', category: 'health' },
  { _id: 'h2', name: 'Houston Wellness Center (AHF)', url: 'https://locations.aidshealth.org/tx-houston-wellness18-25', category: 'health' },
  { _id: 'h3', name: 'Avenue 360', url: 'https://avenue360.org/', category: 'health' },
  { _id: 'h4', name: 'BWell Counseling Center', url: 'https://www.bwellcounselingcenter.com/', category: 'health' },
  { _id: 'h5', name: 'Fort Bend County HHS', url: 'https://www.fortbendcountytx.gov/government/departments/health-and-human-services', category: 'health' },
  { _id: 'h6', name: 'Legacy Community Health', url: 'https://www.legacycommunityhealth.org/', category: 'health' },
  { _id: 'h7', name: 'SBCHC', url: 'https://sbchc.net/', category: 'health' },
  { _id: 'h8', name: 'VADA Counseling', url: 'https://www.vadacounseling.com/', category: 'health' },
  { _id: 'h9', name: 'West Houston Counseling', url: 'https://westhoustoncounseling.com/', category: 'health' },
  { _id: 'a1', name: 'ACLU Texas', url: 'https://www.aclutx.org/', category: 'advocacy' },
  { _id: 'a2', name: 'Equality Texas', url: 'https://www.equalitytexas.org/', category: 'advocacy' },
  { _id: 'a3', name: 'League of Women Voters (Fort Bend)', url: 'https://www.lwv.org/local-leagues/lwv-fort-bend', category: 'advocacy' },
  { _id: 'a4', name: 'Lone Star Legal Aid', url: 'https://www.lonestarlegal.org/', category: 'advocacy' },
  { _id: 'a5', name: 'Somos Loud', url: 'https://somosloud.org/', category: 'advocacy' },
  { _id: 'a6', name: 'Students Engaged in Advancing Texas', url: 'https://www.studentsengaged.org/', category: 'advocacy' },
  { _id: 'a7', name: 'Trans Texas', url: 'https://www.transtexas.org/', category: 'advocacy' },
  { _id: 'a8', name: 'Trans Legal Aid TX', url: 'https://translegalaidtx.com/', category: 'advocacy' },
  { _id: 'a9', name: 'Veterans for Equality', url: 'https://veteransforequality.org/', category: 'advocacy' },
  { _id: 'l1', name: 'First Christian Church Katy', url: 'https://www.fcckaty.com/', category: 'ally' },
  { _id: 'l2', name: 'Hatch Youth', url: 'https://montrosecenter.org/micro-sites/hatch-youth/', category: 'ally' },
  { _id: 'l3', name: 'Houston LGBTQ+ Chamber of Commerce', url: 'https://www.houstonlgbtchamber.com/', category: 'ally' },
  { _id: 'l4', name: 'K-PLACE', url: 'https://fcckaty.org/kplace/', category: 'ally' },
  { _id: 'l5', name: 'Mirus High School - LGBTQ+ Affirming School (8th-12th)', url: 'https://www.mirus-academy.org/', category: 'ally' },
  { _id: 'l6', name: 'Montrose Center', url: 'https://montrosecenter.org/', category: 'ally' },
  { _id: 'l7', name: 'Out for Education', url: 'https://outforeducation.org/', category: 'ally' },
  { _id: 'l8', name: 'Parents of Trans Youth', url: 'https://www.parentsoftransyouth.com/', category: 'ally' },
  { _id: 'l9', name: 'PFLAG Houston', url: 'https://www.pflaghouston.org/', category: 'ally' },
  { _id: 'l10', name: 'The Normal Anomaly Initiative, Inc.', url: 'https://www.normalanomaly.org/', category: 'ally' },
  { _id: 'l11', name: "Tony's Place", url: 'https://tonysplace.org/', category: 'ally' },
  { _id: 'l12', name: 'Trans Masculine Alliance Houston', url: 'https://transmasculinehouston.com/', category: 'ally' },
  { _id: 'l13', name: 'Transparent Closet', url: 'https://fcckaty.org/transparent-closet/', category: 'ally' },
  { _id: 'r1', name: 'Brazoria County Pride', url: 'https://www.brazoriacountypride.com/', category: 'regional' },
  { _id: 'r2', name: 'Columbus Pride', url: 'https://www.columbustxpride.com/', category: 'regional' },
  { _id: 'r3', name: 'Fort Bend County Pride', url: 'https://www.fortbendcountypride.org/', category: 'regional' },
  { _id: 'r4', name: 'Pride Galveston', url: 'https://pridegalveston.com/', category: 'regional' },
  { _id: 'r5', name: 'New Faces of Pride', url: 'https://newfacesofpride.org/', category: 'regional' },
  { _id: 'r6', name: 'Pride Houston', url: 'https://pridehouston365.org/', category: 'regional' },
  { _id: 'r7', name: 'The Woodlands Pride', url: 'https://www.thewoodlandspride.org/', category: 'regional' },
  { _id: 'r8', name: 'Third Coast Pride', url: 'https://gaygalveston.com/', category: 'regional' },
  { _id: 'n1', name: 'ACLU (American Civil Liberties Union)', url: 'https://www.aclu.org/', category: 'national' },
  { _id: 'n2', name: 'AHF (Aids Healthcare Foundation)', url: 'https://ahf.org/', category: 'national' },
  { _id: 'n3', name: 'AHF Pharmacy', url: 'https://ahfpharmacy.org/', category: 'national' },
  { _id: 'n4', name: 'Glaad', url: 'https://glaad.org/', category: 'national' },
  { _id: 'n5', name: 'GLSEN', url: 'https://www.glsen.org/', category: 'national' },
  { _id: 'n6', name: 'Human Rights Campaign', url: 'https://www.hrc.org/', category: 'national' },
  { _id: 'n7', name: 'It Gets Better Project', url: 'https://itgetsbetter.org/', category: 'national' },
  { _id: 'n8', name: 'Lambda Legal', url: 'https://lambdalegal.org/', category: 'national' },
  { _id: 'n9', name: 'PFLAG', url: 'https://pflag.org/', category: 'national' },
  { _id: 'n10', name: 'Planned Parenthood', url: 'https://www.plannedparenthood.org/', category: 'national' },
  { _id: 'n11', name: 'Trans Lifeline', url: 'https://translifeline.org/', category: 'national' },
  { _id: 'n12', name: 'Trevor Project', url: 'https://www.thetrevorproject.org/', category: 'national' },
]

async function getResourceLinks(previewMode = false): Promise<ResourceLink[]> {
  const query = `*[_type == "resourceLink" && active == true] | order(orderRank asc) {
      _id,
      name,
      url,
      category
    }`
  
  const sanityResources = previewMode 
    ? await getDraftContent(query) as ResourceLink[]
    : await client.fetch<ResourceLink[]>(query)
    
  // Merge Sanity resources with defaults - Sanity resources appear first, then defaults
  // Use a Set to track URLs and avoid duplicates
  const seenUrls = new Set(sanityResources.map((r: ResourceLink) => r.url))
  const uniqueDefaults = defaultResources.filter((r) => !seenUrls.has(r.url))
  return [...sanityResources, ...uniqueDefaults]
}

export default async function ResourcesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const preview = isPreviewMode(searchParams)
  const resources = await getResourceLinks(preview)

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
      pillText: "text-[#036600]",
      chipBorder: "border-[#06bd01]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#06bd01]/10",
      chipText: "text-[#036600]",
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
      pillText: "text-[#a80f14]",
      chipBorder: "border-[#ff1c25]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#ff1c25]/10",
      chipText: "text-[#a80f14]",
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
      pillText: "text-[#760088]",
      chipBorder: "border-[#760088]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#760088]/10",
      chipText: "text-[#760088]",
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
      pillText: "text-[#a94e00]",
      chipBorder: "border-[#fe931f]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#fe931f]/10",
      chipText: "text-[#a94e00]",
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
      pillText: "text-[#021999]",
      chipBorder: "border-[#021999]/40",
      chipBg: "bg-white",
      chipHoverBg: "hover:bg-[#021999]/10",
      chipText: "text-[#021999]",
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
      className={`font-heading antialiased inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-[13px] font-semibold leading-none tracking-wide shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accent.chipBorder} ${accent.chipBg} ${accent.chipHoverBg} ${accent.chipText} ${accent.ring}`}
    >
      {label}
    </a>
  )

  const LinkItem = ({
    name,
    href,
    accent,
  }: {
    name: string
    href: string
    accent: Accent
  }) => (
    <li className="h-full">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} — Visit website (opens in a new tab)`}
        className={`group flex h-full items-start justify-between gap-4 rounded-2xl border border-l-4 px-4 py-4 shadow transition focus-visible:outline-none focus-visible:ring-2 ${accent.cardBg} ${accent.cardHoverBg} ${accent.cardBorder} ${accent.cardHoverBorder} ${accent.stripe} ${accent.ring}`}
      >
        <span className="min-w-0">
          <span className="font-heading text-lg text-gray-900 group-hover:text-purple-950 group-hover:underline decoration-purple-300 underline-offset-4">
            {name}
          </span>
          <span className="mt-1 block text-sm text-gray-600 break-words" title={href}>
            {getHostname(href)}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`font-heading antialiased mt-0.5 shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold leading-none tracking-wide transition-all duration-200 ${accent.pillBorder} ${accent.pillBg} ${accent.pillText} ${accent.pillHoverBg}`}
        >
          Visit →
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
    items: Array<{ _id: string; name: string; url: string }>
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
            key={item._id}
            name={item.name}
            href={item.url}
            accent={accent}
          />
        ))}
      </ul>
      <BackToCategories />
    </section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      {preview && <PreviewBanner />}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            LGBTQ Local & National Resources
          </h1>

          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
            Community resources and support links.
          </p>

          <nav id="categories" aria-label="Resource categories" className="mt-6 scroll-mt-24">
            <p className="text-sm text-gray-600 mb-3">
              Select a category to jump to that section.
            </p>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
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
  )
}

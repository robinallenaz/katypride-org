export default function ResourcesPage() {
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
    items: Array<{ name: string; href: string }>
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
            key={item.href}
            name={item.name}
            href={item.href}
            accent={accent}
          />
        ))}
      </ul>
      <BackToCategories />
    </section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
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
            items={[
              { name: "AHF Pharmacy", href: "https://ahfpharmacy.org/" },
              {
                name: "Houston Wellness Center (AHF)",
                href: "https://locations.aidshealth.org/tx-houston-wellness18-25",
              },
              { name: "Avenue 360", href: "https://avenue360.org/" },
              {
                name: "BWell Counseling Center",
                href: "https://www.bwellcounselingcenter.com/",
              },
              {
                name: "Fort Bend County HHS",
                href: "https://www.fortbendcountytx.gov/government/departments/health-and-human-services",
              },
              {
                name: "Legacy Community Health",
                href: "https://www.legacycommunityhealth.org/",
              },
              { name: "SBCHC", href: "https://sbchc.net/" },
              { name: "VADA Counseling", href: "https://www.vadacounseling.com/" },
              {
                name: "West Houston Counseling",
                href: "https://westhoustoncounseling.com/",
              },
            ]}
          />

          <Section
            title="LGBTQ Advocacy Resources"
            id="lgbtq-advocacy"
            accent={accents.advocacy}
            items={[
              { name: "ACLU Texas", href: "https://www.aclutx.org/" },
              { name: "Equality Texas", href: "https://www.equalitytexas.org/" },
              {
                name: "League of Women Voters (Fort Bend)",
                href: "https://www.lwv.org/local-leagues/lwv-fort-bend",
              },
              { name: "Lone Star Legal Aid", href: "https://www.lonestarlegal.org/" },
              { name: "Somos Loud", href: "https://somosloud.org/" },
              {
                name: "Students Engaged",
                href: "https://www.studentsengaged.org/home",
              },
              { name: "Trans Texas", href: "https://www.transtexas.org/" },
              { name: "Trans Legal Aid TX", href: "https://translegalaidtx.com/" },
              {
                name: "Veterans for Equality",
                href: "https://veteransforequality.org/",
              },
            ]}
          />

          <Section
            title="LGBTQ & Ally Resources"
            id="lgbtq-and-ally"
            accent={accents.ally}
            items={[
              { name: "First Christian Church Katy", href: "https://www.fcckaty.com/" },
              {
                name: "Hatch Youth",
                href: "https://montrosecenter.org/micro-sites/hatch-youth/",
              },
              {
                name: "Houston LGBTQ+ Chamber of Commerce",
                href: "https://www.houstonlgbtchamber.com/",
              },
              { name: "K-PLACE", href: "https://fcckaty.org/kplace/" },
              {
                name: "Mirus High School - LGBTQ+ Affirming School (8th-12th)",
                href: "https://www.mirus-academy.org/",
              },
              { name: "Montrose Center", href: "https://montrosecenter.org/" },
              { name: "Out for Education", href: "https://outforeducation.org/" },
              {
                name: "Parents of Trans Youth",
                href: "https://www.parentsoftransyouth.com/",
              },
              { name: "PFLAG Houston", href: "https://www.pflaghouston.org/" },
              {
                name: "The Normal Anomaly Initiative, Inc.",
                href: "https://www.normalanomaly.org/",
              },
              { name: "Tony's Place", href: "https://tonysplace.org/" },
              {
                name: "Trans Masculine Alliance Houston",
                href: "https://transmasculinehouston.com/",
              },
              {
                name: "Transparent Closet",
                href: "https://fcckaty.org/transparent-closet/",
              },
            ]}
          />

          <Section
            title="Regional Pride Resources"
            id="regional-pride"
            accent={accents.regional}
            items={[
              {
                name: "Brazoria County Pride",
                href: "https://www.brazoriacountypride.com/",
              },
              { name: "Columbus Pride", href: "https://www.columbustxpride.com/" },
              {
                name: "Fort Bend County Pride",
                href: "https://www.fortbendcountypride.org/",
              },
              { name: "Pride Galveston", href: "https://pridegalveston.com/" },
              { name: "New Faces of Pride", href: "https://newfacesofpride.org/" },
              { name: "Pride Houston", href: "https://pridehouston365.org/" },
              {
                name: "The Woodlands Pride",
                href: "https://www.thewoodlandspride.org/",
              },
              { name: "Third Coast Pride", href: "https://gaygalveston.com/" },
            ]}
          />

          <Section
            title="National LGBTQ Resources"
            id="national-resources"
            accent={accents.national}
            items={[
              { name: "ACLU (American Civil Liberties Union)", href: "https://www.aclutx.org/" },
              {
                name: "AHF (Aids Healthcare Foundation)",
                href: "https://ahf.org/",
              },
              { name: "AHF Pharmacy", href: "https://ahfpharmacy.org/" },
              { name: "Glaad", href: "https://glaad.org/" },
              { name: "GLSEN", href: "https://www.glsen.org/" },
              { name: "Human Rights Campaign", href: "https://www.hrc.org/" },
              { name: "It Gets Better Project", href: "https://itgetsbetter.org/" },
              { name: "Lambda Legal", href: "https://lambdalegal.org/" },
              { name: "PFLAG", href: "https://pflag.org/" },
              {
                name: "Planned Parenthood",
                href: "https://www.plannedparenthood.org/",
              },
              { name: "Trans Lifeline", href: "https://translifeline.org/" },
              {
                name: "Trevor Project",
                href: "https://www.thetrevorproject.org/",
              },
            ]}
          />
        </div>
      </section>
    </div>
  )
}

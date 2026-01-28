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

  const accents: Record<string, Accent> = {
    health: {
      cardBg: "bg-white/85",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-[#06bd01]/35",
      cardHoverBorder: "hover:border-[#06bd01]/55",
      stripe: "border-l-[#06bd01]",
      ring: "focus-visible:ring-[#06bd01]",
      pillBorder: "border-[#06bd01]/50",
      pillBg: "bg-[#06bd01]/15",
      pillHoverBg: "group-hover:bg-[#06bd01]/25",
      pillText: "text-green-900",
      chipBorder: "border-[#06bd01]/45",
      chipBg: "bg-[#06bd01]/12",
      chipHoverBg: "hover:bg-[#06bd01]/20",
      chipText: "text-gray-900",
    },
    advocacy: {
      cardBg: "bg-white/85",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-[#ff1c25]/35",
      cardHoverBorder: "hover:border-[#ff1c25]/55",
      stripe: "border-l-[#ff1c25]",
      ring: "focus-visible:ring-[#ff1c25]",
      pillBorder: "border-[#ff1c25]/50",
      pillBg: "bg-[#ff1c25]/15",
      pillHoverBg: "group-hover:bg-[#ff1c25]/25",
      pillText: "text-red-900",
      chipBorder: "border-[#ff1c25]/45",
      chipBg: "bg-[#ff1c25]/12",
      chipHoverBg: "hover:bg-[#ff1c25]/20",
      chipText: "text-gray-900",
    },
    ally: {
      cardBg: "bg-white/85",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-[#760088]/35",
      cardHoverBorder: "hover:border-[#760088]/55",
      stripe: "border-l-[#760088]",
      ring: "focus-visible:ring-[#760088]",
      pillBorder: "border-[#760088]/50",
      pillBg: "bg-[#760088]/15",
      pillHoverBg: "group-hover:bg-[#760088]/25",
      pillText: "text-purple-900",
      chipBorder: "border-[#760088]/45",
      chipBg: "bg-[#760088]/12",
      chipHoverBg: "hover:bg-[#760088]/20",
      chipText: "text-gray-900",
    },
    regional: {
      cardBg: "bg-white/85",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-[#fe931f]/45",
      cardHoverBorder: "hover:border-[#fe931f]/65",
      stripe: "border-l-[#fe931f]",
      ring: "focus-visible:ring-[#fe931f]",
      pillBorder: "border-[#fe931f]/60",
      pillBg: "bg-[#fe931f]/18",
      pillHoverBg: "group-hover:bg-[#fe931f]/28",
      pillText: "text-amber-950",
      chipBorder: "border-[#fe931f]/55",
      chipBg: "bg-[#fe931f]/14",
      chipHoverBg: "hover:bg-[#fe931f]/22",
      chipText: "text-gray-900",
    },
    national: {
      cardBg: "bg-white/85",
      cardHoverBg: "hover:bg-white",
      cardBorder: "border-[#021999]/35",
      cardHoverBorder: "hover:border-[#021999]/55",
      stripe: "border-l-[#021999]",
      ring: "focus-visible:ring-[#021999]",
      pillBorder: "border-[#021999]/50",
      pillBg: "bg-[#021999]/15",
      pillHoverBg: "group-hover:bg-[#021999]/25",
      pillText: "text-indigo-950",
      chipBorder: "border-[#021999]/45",
      chipBg: "bg-[#021999]/12",
      chipHoverBg: "hover:bg-[#021999]/20",
      chipText: "text-gray-900",
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
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${accent.chipBorder} ${accent.chipBg} ${accent.chipText} ${accent.chipHoverBg} ${accent.ring}`}
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
        aria-label={`${name} (opens in a new tab)`}
        className={`group flex h-full items-start justify-between gap-4 rounded-2xl border border-l-4 px-4 py-4 shadow transition focus-visible:outline-none focus-visible:ring-2 ${accent.cardBg} ${accent.cardHoverBg} ${accent.cardBorder} ${accent.cardHoverBorder} ${accent.stripe} ${accent.ring}`}
      >
        <span className="min-w-0">
          <span className="font-heading text-lg text-gray-900 group-hover:text-purple-950 group-hover:underline decoration-purple-300 underline-offset-4">
            {name}
          </span>
          <span className="mt-1 block text-sm text-gray-600 break-words">
            {href}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`mt-0.5 shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${accent.pillBorder} ${accent.pillBg} ${accent.pillText} ${accent.pillHoverBg}`}
        >
          External
        </span>
      </a>
    </li>
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

          <nav aria-label="Resource categories" className="mt-6">
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

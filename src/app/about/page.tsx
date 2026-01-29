export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#760088] mb-4">
            About Us
          </h1>
          <section className="mt-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-4">
              Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
              The mission of Katy Pride is to empower the LGBTQ community in Katy and West Houston by creating inclusive events, advocating for equality, and fostering a supportive community of acceptance and diversity.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-4">
              Vision
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
              The vision of Katy Pride is to create a community where all LGBTQ+ individuals can live authentically and safely without persecution, judgment, hate, or fear.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#760088] mb-4">
              Pronouns Matter: Our Commitment to Respect
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
              We believe in honoring each person's uniqueness by respecting their pronouns, a simple yet powerful way to affirm identity. We encourage everyone to ask, listen, and use pronouns that align with each individual's self-identified gender.
            </p>
          </section>
        </div>
      </section>
    </div>
  )
}

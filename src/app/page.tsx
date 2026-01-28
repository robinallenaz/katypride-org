import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Katy Pride
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Building community, advocating for equality, and celebrating diversity in Katy and beyond.
        </p>
        <div className="space-x-4">
          <a
            href="/about"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors"
          >
            Learn More
          </a>
          <a
            href="/news"
            className="inline-block border border-pink-600 text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition-colors"
          >
            Latest News
          </a>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get Involved</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">Events</h3>
            <p className="text-gray-600">Join us for community events, workshops, and celebrations throughout the year.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">Advocacy</h3>
            <p className="text-gray-600">Help us advance equality and inclusion through education and outreach.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-pink-600 mb-2">Resources</h3>
            <p className="text-gray-600">Access support, information, and connections to local and national organizations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

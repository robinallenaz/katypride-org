import Image from "next/image";
import Carousel from "@/components/Carousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-12 pb-16 mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to Katy Pride
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Building community, advocating for equality, and celebrating diversity in Katy and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/donate"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Make a Donation
            </a>
            <a
              href="/newsletter"
              className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-center"
            >
              Stay in the Know!
              <span className="block text-sm font-normal mt-1">Sign Up for Our Newsletter</span>
            </a>
            <a
              href="/volunteer"
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 text-center"
            >
              Volunteer at Katy Pride
            </a>
          </div>
        </div>
      </div>

      <Carousel />

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-8 text-center">Get Involved</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Events</h3>
              <p className="text-gray-700">Join us for community events, workshops, and celebrations throughout the year.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Advocacy</h3>
              <p className="text-gray-700">Help us advance equality and inclusion through education and outreach.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Resources</h3>
              <p className="text-gray-700">Access support, information, and connections to local and national organizations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

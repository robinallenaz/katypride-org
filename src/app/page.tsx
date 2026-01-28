import Carousel from "@/components/Carousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-black/5 shadow-xl p-8 md:p-10 mb-10">
          <h1 className="font-heading text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to Katy Pride
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Building community, advocating for equality,<br />and celebrating diversity in Katy and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch">
            <a
              href="/donate"
              className="font-heading inline-flex min-w-[240px] flex-col items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Make a Donation</span>
              <span className="mt-0.5 text-sm font-normal text-white/90">Support our mission</span>
            </a>
            <a
              href="/newsletter"
              className="font-heading inline-flex min-w-[240px] flex-col items-center justify-center rounded-full bg-gradient-to-r from-[#6ac5f1] to-[#021999] px-7 py-3 font-semibold text-white shadow-md transition-all hover:from-[#4fb9ee] hover:to-[#02137a] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#021999] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Stay in the Know!</span>
              <span className="mt-0.5 text-sm font-normal text-white/90">Sign Up for Our Newsletter</span>
            </a>
            <a
              href="/volunteer"
              className="font-heading inline-flex min-w-[240px] flex-col items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-3 font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span>Volunteer at Katy Pride</span>
              <span className="mt-0.5 text-sm font-normal text-white/90">Join the team</span>
            </a>
          </div>
        </div>
      </div>

      <Carousel />

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-8 text-center">Get Involved</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#06bd01]">
              <h3 className="font-heading text-xl font-semibold text-[#06bd01] mb-2">Events</h3>
              <p className="text-gray-700">Join us for community events, workshops, and celebrations throughout the year.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#ff1c25]">
              <h3 className="font-heading text-xl font-semibold text-[#ff1c25] mb-2">Advocacy</h3>
              <p className="text-gray-700">Help us advance equality and inclusion through education and outreach.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-[#760088]">
              <h3 className="font-heading text-xl font-semibold text-[#760088] mb-2">Resources</h3>
              <p className="text-gray-700">Access support, information, and connections to local and national organizations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

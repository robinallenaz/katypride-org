// Use /vendor-test for CRM integration testing
export default function VendorSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-8">
            Vendor Registration
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            For CRM testing, use the vendor test page.
          </p>
          <a 
            href="/vendor-test" 
            className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Test CRM Integration Here
          </a>
        </div>
      </div>
    </div>
  );
}
          

export default function News() {
  const posts = [
    {
      slug: 'pride-2025-announcement',
      title: 'Katy Pride 2025: Dates and Theme Announced',
      excerpt: 'Join us for our biggest celebration yet! This year’s theme is “Unity in Diversity.”',
      date: '2025-01-15',
    },
    {
      slug: 'volunteer-spotlight',
      title: 'Volunteer Spotlight: Meet Alex',
      excerpt: 'Alex shares their journey with Katy Pride and why community matters.',
      date: '2025-01-08',
    },
    {
      slug: 'new-partnership',
      title: 'New Partnership with Local Schools',
      excerpt: 'We’re excited to launch inclusive education programs in Katy ISD.',
      date: '2024-12-20',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">News & Updates</h1>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-pink-600 font-medium mb-2">{post.date}</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                <a href={`/news/${post.slug}`} className="hover:text-pink-600 transition-colors">
                  {post.title}
                </a>
              </h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <a
                href={`/news/${post.slug}`}
                className="inline-block text-pink-600 font-medium hover:underline"
              >
                Read more →
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

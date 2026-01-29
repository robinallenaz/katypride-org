import Link from "next/link"

export function generateStaticParams() {
  return [
    { slug: "pride-2025-announcement" },
    { slug: "volunteer-spotlight" },
    { slug: "new-partnership" },
  ]
}

export default function NewsPost({ params }: { params: { slug: string } }) {
  const posts: Record<string, { title: string; date: string; body: string }> = {
    'pride-2025-announcement': {
      title: 'Katy Pride 2025: Dates and Theme Announced',
      date: '2025-01-15',
      body: `We are thrilled to announce the dates and theme for Katy Pride 2025! This year’s celebration will take place from June 14–21, 2025, with the main parade and festival on Saturday, June 21.

Our theme, “Unity in Diversity,” highlights the strength that comes from our many voices, experiences, and identities. Throughout the week, we’ll host educational workshops, community dialogues, family-friendly events, and performances that celebrate our differences while bringing us closer together.

Mark your calendars and get ready to celebrate with us! More details on events, volunteer opportunities, and sponsorships will be shared in the coming weeks.`,
    },
    'volunteer-spotlight': {
      title: 'Volunteer Spotlight: Meet Alex',
      date: '2025-01-08',
      body: `This month, we’re shining a spotlight on Alex, one of our most dedicated volunteers. Alex joined Katy Pride three years ago and has been instrumental in organizing our youth outreach programs.

“I found a family here,” Alex shares. “Being part of Katy Pride gave me the courage to be my authentic self and help others do the same.”

Alex coordinates our monthly youth support groups and helps plan our annual education summit. When asked what keeps them motivated, Alex says, “Seeing a young person’s face light up when they realize they’re not alone—that’s everything.”

Thank you, Alex, for your incredible commitment to our community!`,
    },
    'new-partnership': {
      title: 'New Partnership with Local Schools',
      date: '2024-12-20',
      body: `Katy Pride is excited to announce a new partnership with Katy Independent School District to bring inclusive education programs to local schools.

Starting spring 2025, we’ll be offering:

- Age-appropriate diversity and inclusion workshops
- Teacher training on creating safe classroom spaces
- Student-led allyship clubs
- Resource libraries for students and families

This partnership represents a significant step forward in our mission to foster understanding and acceptance across all generations of Katy residents.

We’re currently seeking volunteers to help develop and deliver these programs. If you have experience in education or simply want to make a difference, please reach out!`,
    },
  }

  const post = posts[params.slug]

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link href="/news" className="text-purple-600 hover:underline">
            Back to News
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-sm text-purple-600 font-medium mb-4">{post.date}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{post.title}</h1>
          <div className="prose prose-lg max-w-none">
            {post.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link href="/news" className="text-purple-600 font-medium hover:underline">
              ← Back to News
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

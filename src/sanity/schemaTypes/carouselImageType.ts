export default {
  name: 'carouselImage',
  title: 'Carousel Image',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Image Title',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(3).max(100),
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
        },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Enable to show this image in the carousel',
      initialValue: true,
    },
  ],
  orderings: [
    {
      name: 'createdAtAsc',
      title: 'Creation Date (Oldest First)',
      by: [{ field: '_createdAt', direction: 'asc' }],
    },
    {
      name: 'createdAtDesc',
      title: 'Creation Date (Newest First)',
      by: [{ field: '_createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      isActive: 'isActive',
    },
    prepare: ({ title, media, isActive }: any) => ({
      title: `${title} ${isActive ? '✅' : '❌'}`,
      media,
    }),
  },
}

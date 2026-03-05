export default {
  name: 'websiteImage',
  title: 'Website Image',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Image Name',
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
      name: 'category',
      title: 'Image Category',
      type: 'string',
      options: {
        list: [
          { title: 'Hero', value: 'hero' },
          { title: 'Event', value: 'event' },
          { title: 'Celebration', value: 'celebration' },
          { title: 'Advocacy', value: 'advocacy' },
          { title: 'Resource', value: 'resource' },
          { title: 'General', value: 'general' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Enable to use this image on the website',
      initialValue: true,
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Optional notes about when or where this image should be used',
    },
  ],
  orderings: [
    {
      name: 'nameAsc',
      title: 'Name (A-Z)',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      name: 'categoryAsc',
      title: 'Category (A-Z)',
      by: [{ field: 'category', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      name: 'name',
      category: 'category',
      media: 'image',
      isActive: 'isActive',
    },
    prepare: ({ name, category, media, isActive }: any) => ({
      title: `${name} (${category}) ${isActive ? '✅' : '❌'}`,
      media,
    }),
  },
}

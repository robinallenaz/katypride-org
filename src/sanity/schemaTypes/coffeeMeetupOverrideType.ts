import { defineField, defineType } from 'sanity'

export const coffeeMeetupOverrideType = defineType({
  name: 'coffeeMeetupOverride',
  title: 'Coffee Meetup Override',
  type: 'document',
  fields: [
    defineField({
      name: 'meetupDate',
      title: 'Meetup Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cancelled',
      title: 'Cancelled',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'start',
      title: 'Start (optional override)',
      type: 'datetime',
    }),
    defineField({
      name: 'end',
      title: 'End (optional override)',
      type: 'datetime',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
    }),
    defineField({
      name: 'directionsUrl',
      title: 'Directions URL',
      type: 'url',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
    }),
    defineField({
      name: 'externalCtaLabel',
      title: 'External Link Button Text',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      meetupDate: 'meetupDate',
      cancelled: 'cancelled',
      media: 'image',
    },
    prepare({ title, meetupDate, cancelled, media }) {
      const formattedDate = meetupDate
        ? new Date(meetupDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : ''

      return {
        title: title || 'Coffee meetup override',
        subtitle: cancelled ? `${formattedDate} (cancelled)` : formattedDate,
        media,
      }
    },
  },
})

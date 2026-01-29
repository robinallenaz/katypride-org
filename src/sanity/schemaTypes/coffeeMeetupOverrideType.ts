import { UsersIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const coffeeMeetupOverrideType = defineType({
  name: 'coffeeMeetupOverride',
  title: 'Coffee Meetup Override',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'meetupDate',
      title: 'Meetup Date',
      type: 'date',
      description: 'Which coffee meetup date do you want to customize? (must be a 2nd Friday)',
      validation: (Rule) => Rule.required().error('Please select the meetup date to override'),
    }),
    defineField({
      name: 'cancelled',
      title: 'Cancelled',
      type: 'boolean',
      description: 'Check this to remove this meetup from the website',
      initialValue: false,
    }),
    defineField({
      name: 'title',
      title: 'Custom Title',
      type: 'string',
      placeholder: 'e.g., Special Holiday Coffee Meetup',
      description: 'Leave blank to use the default "Espresso Yourself" title',
    }),
    defineField({
      name: 'start',
      title: 'Custom Start Time',
      type: 'datetime',
      description: 'Leave blank to use the default time (8:00 AM)',
    }),
    defineField({
      name: 'end',
      title: 'Custom End Time',
      type: 'datetime',
      description: 'Leave blank to use the default time (10:00 AM)',
    }),
    defineField({
      name: 'location',
      title: 'Custom Location',
      type: 'string',
      placeholder: 'e.g., Different Coffee Shop',
      description: 'Leave blank to use the default location (Coffee Fellows)',
    }),
    defineField({
      name: 'address',
      title: 'Custom Address',
      type: 'string',
      placeholder: 'e.g., 123 Main St, Katy, TX',
      description: 'Leave blank to use the default address',
    }),
    defineField({
      name: 'directionsUrl',
      title: 'Directions Link',
      type: 'url',
      placeholder: 'https://www.google.com/maps/dir/...',
      description: 'Google Maps directions link (optional)',
    }),
    defineField({
      name: 'summary',
      title: 'Custom Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Special notes or description for this meetup',
    }),
    defineField({
      name: 'image',
      title: 'Custom Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Custom flyer for this specific meetup',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External Link',
      type: 'url',
      placeholder: 'https://...',
      description: 'Link to RSVP or more info (optional)',
    }),
    defineField({
      name: 'externalCtaLabel',
      title: 'External Link Button Text',
      type: 'string',
      placeholder: 'e.g., RSVP, Learn more',
      description: 'Text shown on the button',
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

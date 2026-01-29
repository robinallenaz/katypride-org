import { UsersIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const coffeeMeetupOverrideType = defineType({
  name: 'coffeeMeetupOverride',
  title: 'Coffee Meetup Override',
  type: 'document',
  icon: UsersIcon,
  description: 'Customize or cancel specific coffee meetup dates. These override the recurring "Espresso Yourself" coffee meetups that normally happen on the 2nd Friday of each month.',
  fields: [
    defineField({
      name: 'meetupDate',
      title: 'Meetup Date',
      type: 'date',
      description: 'Which coffee meetup date to customize? The override only affects this specific date.',
      validation: (Rule) => Rule.required().error('Please select the meetup date to override'),
    }),
    defineField({
      name: 'cancelled',
      title: 'Cancel This Meetup',
      type: 'boolean',
      description: 'Check to completely remove this coffee meetup from the website for the selected date.',
      initialValue: false,
    }),
    defineField({
      name: 'title',
      title: 'Custom Title',
      type: 'string',
      placeholder: 'e.g., Special Holiday Coffee Meetup',
      description: 'Custom title for this specific meetup. Leave blank to use "Espresso Yourself: Community Coffee Meet-Up".',
    }),
    defineField({
      name: 'start',
      title: 'Custom Start Time',
      type: 'datetime',
      description: 'Custom start time for this meetup only. Leave blank to use the default 8:00 AM.',
    }),
    defineField({
      name: 'end',
      title: 'Custom End Time',
      type: 'datetime',
      description: 'Custom end time for this meetup only. Leave blank to use the default 10:00 AM.',
      validation: (Rule) => 
        Rule.custom((field, context) => {
          const parent = context.parent as { start?: string }
          const start = parent.start
          if (start && field && new Date(field) <= new Date(start)) {
            return 'End time must be after start time'
          }
          return true
        }),
    }),
    defineField({
      name: 'location',
      title: 'Custom Location',
      type: 'string',
      placeholder: 'e.g., Different Coffee Shop',
      description: 'Different venue for this specific meetup. Leave blank to use the default location (Coffee Fellows).',
    }),
    defineField({
      name: 'address',
      title: 'Custom Address',
      type: 'string',
      placeholder: 'e.g., 123 Main St, Katy, TX',
      description: 'Address for the custom location. Leave blank to use the default address.',
    }),
    defineField({
      name: 'directionsUrl',
      title: 'Google Maps Directions',
      type: 'url',
      placeholder: 'https://www.google.com/maps/dir/...',
      description: 'Google Maps directions link for the custom location. Leave blank to use default directions.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }).error('Please enter a valid Google Maps URL'),
    }),
    defineField({
      name: 'summary',
      title: 'Custom Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Special notes, agenda, or description for this specific meetup. Supports formatting.',
    }),
    defineField({
      name: 'image',
      title: 'Custom Flyer/Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Custom flyer or image for this specific meetup. Leave blank to use the default coffee meetup image.',
    }),
    defineField({
      name: 'externalUrl',
      title: 'RSVP or Info Link',
      type: 'url',
      placeholder: 'https://...',
      description: 'Link to RSVP form, Facebook event, or more information (optional). Creates a button on the event.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL starting with https://'),
    }),
    defineField({
      name: 'externalCtaLabel',
      title: 'Button Text',
      type: 'string',
      placeholder: 'e.g., RSVP, Learn more',
      description: 'Text for the RSVP/info button. If blank, defaults to "Visit".',
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

import { CalendarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  description: 'Events appear on the /events page in chronological order. Published events with future dates are visible to visitors.',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      placeholder: 'e.g., Katy Pride Celebration 2026',
      description: 'The event name that appears on the website and in event listings',
      validation: (Rule) => Rule.required().error('Event title is required - this is what visitors will see'),
    }),
    defineField({
      name: 'start',
      title: 'Start Date & Time',
      type: 'datetime',
      description: 'When the event begins. Events are sorted by this date. Only future events appear on the website.',
      validation: (Rule) => Rule.required().error('Start date and time are required'),
    }),
    defineField({
      name: 'end',
      title: 'End Date & Time',
      type: 'datetime',
      description: 'When the event ends (optional). Leave blank if no specific end time.',
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
      title: 'Location',
      type: 'string',
      placeholder: 'e.g., Katy City Park',
    }),
    defineField({
      name: 'summary',
      title: 'Event Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed description that appears when visitors click "More info". Supports bold, italic, links, and lists.',
    }),
    defineField({
      name: 'image',
      title: 'Event Image/Flyer',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload a flyer or promotional image. Recommended size: 1400px wide, high quality. Appears as the main event image.',
    }),
    defineField({
      name: 'externalUrl',
      title: 'Registration/Tickets Link',
      type: 'url',
      placeholder: 'https://...',
      description: 'Link to buy tickets, RSVP, or get more information (optional). Creates a button on the event card.',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL starting with https://'),
    }),
    defineField({
      name: 'externalCtaLabel',
      title: 'Button Text',
      type: 'string',
      placeholder: 'e.g., Buy tickets, RSVP, Register',
      description: 'Custom text for the registration button (optional). If blank, defaults to "Learn more".',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Uncheck to hide this event from the website without deleting it. Draft events are only visible to admins.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      start: 'start',
      media: 'image',
    },
    prepare({ title, start, media }) {
      const formattedStart = start
        ? new Date(start).toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : ''

      return {
        title: title || 'Untitled event',
        subtitle: formattedStart,
        media,
      }
    },
  },
})

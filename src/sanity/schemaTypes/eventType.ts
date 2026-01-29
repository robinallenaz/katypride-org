import { CalendarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      placeholder: 'e.g., Katy Pride Celebration 2026',
      validation: (Rule) => Rule.required().error('Please enter an event title'),
    }),
    defineField({
      name: 'start',
      title: 'Start Date & Time',
      type: 'datetime',
      description: 'When does the event begin?',
      validation: (Rule) => Rule.required().error('Please select a start date and time'),
    }),
    defineField({
      name: 'end',
      title: 'End Date & Time',
      type: 'datetime',
      description: 'When does the event end? (optional)',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      placeholder: 'e.g., Katy City Park',
      description: 'Venue or location name',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Event description shown when visitors click "More info"',
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Flyer or promotional image for the event',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External Link',
      type: 'url',
      placeholder: 'https://...',
      description: 'Link to tickets, registration, or more info (optional)',
    }),
    defineField({
      name: 'externalCtaLabel',
      title: 'External Link Button Text',
      type: 'string',
      placeholder: 'e.g., Buy tickets, RSVP, Register',
      description: 'Text shown on the button (defaults to "Learn more")',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'Uncheck to hide this event from the website',
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

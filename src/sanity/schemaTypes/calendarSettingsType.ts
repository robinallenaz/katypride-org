import { CalendarIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const calendarSettingsType = defineType({
  name: 'calendarSettings',
  title: 'Calendar Settings',
  type: 'document',
  icon: CalendarIcon,
  description: 'Configure the Google Calendar integration for the Calendar page',
  fields: [
    defineField({
      name: 'calendarId',
      title: 'Google Calendar ID',
      type: 'string',
      description: 'The Google Calendar ID to embed. Find this in Google Calendar settings under "Integrate calendar".',
      validation: (Rule) => Rule.required().error('Calendar ID is required'),
    }),
    defineField({
      name: 'timeZone',
      title: 'Time Zone',
      type: 'string',
      description: 'Time zone for the calendar display (e.g., America/Chicago)',
      initialValue: 'America/Chicago',
      validation: (Rule) => Rule.required().error('Time zone is required'),
    }),
    defineField({
      name: 'calendarTitle',
      title: 'Calendar Title',
      type: 'string',
      description: 'Title displayed on the Calendar page',
      initialValue: 'Calendar',
    }),
    defineField({
      name: 'calendarDescription',
      title: 'Calendar Description',
      type: 'text',
      description: 'Description displayed on the Calendar page',
      initialValue: 'View upcoming Katy Pride events and add them to your own calendar.',
    }),
    defineField({
      name: 'showSubscribeButtons',
      title: 'Show Subscribe Buttons',
      type: 'boolean',
      description: 'Show buttons to open in Google Calendar and subscribe via iCal',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      calendarId: 'calendarId',
      timeZone: 'timeZone',
    },
    prepare({ calendarId, timeZone }) {
      return {
        title: 'Calendar Settings',
        subtitle: `${calendarId} (${timeZone})`,
      }
    },
  },
})

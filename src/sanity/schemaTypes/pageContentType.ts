import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const pageContentType = defineType({
  name: 'pageContent',
  title: 'Page Content',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'page',
      title: 'Page',
      type: 'string',
      description: 'Which page does this content belong to?',
      options: {
        list: [
          { title: 'Celebration', value: 'celebration' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Donate', value: 'donate' },
          { title: 'Events', value: 'events' },
          { title: 'About', value: 'about' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select which page this content is for'),
    }),
    defineField({
      name: 'heading',
      title: 'Page Heading',
      type: 'string',
      placeholder: 'e.g., Katy Pride Celebration',
      description: 'Main heading displayed at the top of the page',
    }),
    defineField({
      name: 'intro',
      title: 'Intro Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Introductory paragraph displayed below the heading. Supports bold, italic, links, and lists.',
    }),
  ],
  preview: {
    select: {
      page: 'page',
      heading: 'heading',
    },
    prepare({ page, heading }) {
      const pageNames: Record<string, string> = {
        celebration: 'Celebration',
        volunteer: 'Volunteer',
        donate: 'Donate',
        events: 'Events',
        about: 'About',
      }
      return {
        title: pageNames[page] || page || 'Untitled',
        subtitle: heading || 'No heading set',
      }
    },
  },
})

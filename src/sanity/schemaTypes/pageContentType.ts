import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const pageContentType = defineType({
  name: 'pageContent',
  title: 'Page Content',
  type: 'document',
  icon: DocumentTextIcon,
  description: 'Customize page headings and introductory text. This allows you to personalize the main content area of specific pages.',
  fields: [
    defineField({
      name: 'page',
      title: 'Target Page',
      type: 'string',
      description: 'Which page should this custom content appear on? Each page can have one content entry.',
      options: {
        list: [
          { title: 'Home Page (/)', value: 'home' },
          { title: 'Celebration (/celebration)', value: 'celebration' },
          { title: 'Volunteer (/volunteer)', value: 'volunteer' },
          { title: 'Donate (/donate)', value: 'donate' },
          { title: 'Events (/events)', value: 'events' },
          { title: 'About (/about)', value: 'about' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select which page this content is for'),
    }),
    defineField({
      name: 'heading',
      title: 'Page Heading',
      type: 'string',
      placeholder: 'e.g., Katy Pride Celebration 2026',
      description: 'The main heading that appears at the top of the page. Leave blank to use the default heading.',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction Text',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Introductory paragraph that appears below the heading. Supports bold, italic, links, lists, and other formatting. Leave blank to use default text.',
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

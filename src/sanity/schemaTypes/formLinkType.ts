import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { LinkIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const formLinkType = defineType({
  name: 'formLink',
  title: 'Form Link',
  type: 'document',
  icon: LinkIcon,
  description: 'Add buttons that link to Google Forms, registration pages, or external forms. These appear as styled buttons on the selected pages.',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'formLink' }),
    defineField({
      name: 'title',
      title: 'Button Text',
      type: 'string',
      placeholder: 'e.g., 2026 Vendor Application',
      description: 'The text that appears on the button. Be descriptive so users know what they\'re clicking.',
      validation: (rule) => rule.required().error('Button text is required - this tells users what the button does'),
    }),
    defineField({
      name: 'url',
      title: 'Form URL',
      type: 'url',
      placeholder: 'https://docs.google.com/forms/...',
      description: 'The complete URL to your Google Form, registration page, or other form. Must start with https://',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL starting with https://'),
    }),
    defineField({
      name: 'page',
      title: 'Display Page',
      type: 'string',
      description: 'Which page should this button appear on? The button will be shown in the page content area.',
      options: {
        list: [
          { title: 'Home Page (/)', value: 'home' },
          { title: 'Celebration (/celebration)', value: 'celebration' },
          { title: 'Volunteer (/volunteer)', value: 'volunteer' },
          { title: 'Donate (/donate)', value: 'donate' },
          { title: 'Events (/events)', value: 'events' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select which page this button should appear on'),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to temporarily hide this button without deleting it. Inactive buttons are only visible to admins.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      page: 'page',
      active: 'active',
    },
    prepare({ title, page, active }) {
      return {
        title: title || 'Untitled Form Link',
        subtitle: `${page || 'No page'} ${active === false ? '(inactive)' : ''}`,
      }
    },
  },
})

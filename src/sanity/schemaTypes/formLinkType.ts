import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { LinkIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const formLinkType = defineType({
  name: 'formLink',
  title: 'Form Link',
  type: 'document',
  icon: LinkIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'formLink' }),
    defineField({
      name: 'title',
      title: 'Button Text',
      type: 'string',
      placeholder: 'e.g., 2026 Vendor Application',
      description: 'Text displayed on the button',
      validation: (rule) => rule.required().error('Please enter button text'),
    }),
    defineField({
      name: 'url',
      title: 'Form URL',
      type: 'url',
      placeholder: 'https://docs.google.com/forms/...',
      description: 'Paste the Google Form or other form URL here',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL starting with https://'),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'string',
      description: 'Which page should this button appear on?',
      options: {
        list: [
          { title: 'Celebration', value: 'celebration' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Donate', value: 'donate' },
          { title: 'Events', value: 'events' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select a page'),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to temporarily hide this button without deleting it',
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

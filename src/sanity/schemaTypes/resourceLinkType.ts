import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { LinkIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const resourceLinkType = defineType({
  name: 'resourceLink',
  title: 'Resource Link',
  type: 'document',
  icon: LinkIcon,
  description: 'Add LGBTQ+ community resources, organizations, and services. These appear on the /resources page organized by category.',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'resourceLink' }),
    defineField({
      name: 'name',
      title: 'Organization/Resource Name',
      type: 'string',
      placeholder: 'e.g., PFLAG Houston',
      description: 'The official name of the organization or resource as it should appear on the website.',
      validation: (rule) => rule.required().error('Resource name is required - this is what visitors will see'),
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      placeholder: 'https://...',
      description: 'The complete URL to the resource\'s website. Must start with https://',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL starting with https://'),
    }),
    defineField({
      name: 'category',
      title: 'Resource Category',
      type: 'string',
      description: 'Which category best describes this resource? Resources are grouped by category on the resources page.',
      options: {
        list: [
          { title: 'Health & Wellness - Healthcare, counseling, mental health services', value: 'health' },
          { title: 'LGBTQ Advocacy - Legal aid, policy organizations, civil rights groups', value: 'advocacy' },
          { title: 'LGBTQ & Ally - Community groups, support organizations, inclusive spaces', value: 'ally' },
          { title: 'Regional Pride - Local Texas pride organizations and events', value: 'regional' },
          { title: 'National Resources - National LGBTQ+ organizations and hotlines', value: 'national' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select a category for this resource'),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to temporarily hide this resource without deleting it. Inactive resources are only visible to admins.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      name: 'name',
      category: 'category',
      active: 'active',
    },
    prepare({ name, category, active }) {
      const categoryNames: Record<string, string> = {
        health: 'Health & Wellness',
        advocacy: 'LGBTQ Advocacy',
        ally: 'LGBTQ & Ally',
        regional: 'Regional Pride',
        national: 'National Resources',
      }
      return {
        title: name || 'Untitled Resource',
        subtitle: `${categoryNames[category] || 'No category'} ${active === false ? '(inactive)' : ''}`,
      }
    },
  },
})

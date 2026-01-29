import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { LinkIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const resourceLinkType = defineType({
  name: 'resourceLink',
  title: 'Resource Link',
  type: 'document',
  icon: LinkIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'resourceLink' }),
    defineField({
      name: 'name',
      title: 'Resource Name',
      type: 'string',
      placeholder: 'e.g., PFLAG Houston',
      description: 'Name of the organization or resource',
      validation: (rule) => rule.required().error('Please enter a resource name'),
    }),
    defineField({
      name: 'url',
      title: 'Website URL',
      type: 'url',
      placeholder: 'https://...',
      description: 'Link to the resource website',
      validation: (rule) => rule.required().uri({ scheme: ['http', 'https'] }).error('Please enter a valid URL'),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Which category does this resource belong to?',
      options: {
        list: [
          { title: 'Health & Wellness', value: 'health' },
          { title: 'LGBTQ Advocacy', value: 'advocacy' },
          { title: 'LGBTQ & Ally', value: 'ally' },
          { title: 'Regional Pride', value: 'regional' },
          { title: 'National Resources', value: 'national' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('Please select a category'),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to temporarily hide this resource without deleting it',
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

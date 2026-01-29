import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Events').schemaType('event').child(S.documentTypeList('event').title('Events')),
      S.listItem()
        .title('Coffee Meetup Overrides')
        .schemaType('coffeeMeetupOverride')
        .child(S.documentTypeList('coffeeMeetupOverride').title('Coffee Meetup Overrides')),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'formLink',
        title: 'Form Links',
        S,
        context,
      }),
      S.listItem()
        .title('Page Content')
        .schemaType('pageContent')
        .child(S.documentTypeList('pageContent').title('Page Content')),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'resourceLink',
        title: 'Resource Links',
        S,
        context,
      }),
      S.divider(),
      ...S
        .documentTypeListItems()
        .filter((listItem) => !['event', 'coffeeMeetupOverride', 'formLink', 'pageContent', 'resourceLink'].includes(listItem.getId() || '')),
    ])

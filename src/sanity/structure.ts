import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Events').schemaType('event').child(S.documentTypeList('event').title('Events')),
      S.listItem()
        .title('Coffee Meetup Overrides')
        .schemaType('coffeeMeetupOverride')
        .child(S.documentTypeList('coffeeMeetupOverride').title('Coffee Meetup Overrides')),
      S.divider(),
      ...S
        .documentTypeListItems()
        .filter((listItem) => !['event', 'coffeeMeetupOverride'].includes(listItem.getId() || '')),
    ])

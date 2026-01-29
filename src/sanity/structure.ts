import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem().title('Events').schemaType('event').child(S.documentTypeList('event').title('Events')),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => listItem.getId() !== 'event'),
    ])

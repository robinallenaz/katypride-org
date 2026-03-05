import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Events')
        .icon(() => '📅')
        .child(
          S.list()
            .title('Events')
            .items([
              S.listItem()
                .title('All Events')
                .icon(() => '📋')
                .child(
                  S.documentTypeList('event')
                    .title('All Events')
                    .filter('_type == "event"')
                    .defaultOrdering([{ field: 'start', direction: 'asc' }])
                ),
              S.listItem()
                .title('General Events')
                .icon(() => '🎉')
                .child(
                  S.documentTypeList('event')
                    .title('General Events')
                    .filter('_type == "event" && eventCategory == "general"')
                    .defaultOrdering([{ field: 'start', direction: 'asc' }])
                ),
              S.listItem()
                .title('Coffee Meetups')
                .icon(() => '☕')
                .child(
                  S.documentTypeList('event')
                    .title('Coffee Meetups')
                    .filter('_type == "event" && eventCategory == "coffee"')
                    .defaultOrdering([{ field: 'start', direction: 'asc' }])
                ),
            ])
        ),
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
      S.listItem()
        .title('Calendar Settings')
        .schemaType('calendarSettings')
        .icon(() => '📅')
        .child(S.documentTypeList('calendarSettings').title('Calendar Settings')),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'resourceLink',
        title: 'Resource Links',
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title('Preview Pages')
        .icon(() => '👁️')
        .child(
          S.list()
            .title('Preview Pages')
            .items([
              S.listItem()
                .title('Home Page')
                .icon(() => '🏠')
                .child(() => {
                  window.open('/?preview=true', '_blank')
                  return S.document().title('Opening Home Preview...')
                }),
              S.listItem()
                .title('About Page')
                .icon(() => 'ℹ️')
                .child(() => {
                  window.open('/about?preview=true', '_blank')
                  return S.document().title('Opening About Preview...')
                }),
              S.listItem()
                .title('Events Page')
                .icon(() => '📅')
                .child(() => {
                  window.open('/events?preview=true', '_blank')
                  return S.document().title('Opening Events Preview...')
                }),
              S.listItem()
                .title('Calendar Page')
                .icon(() => '�')
                .child(() => {
                  window.open('/calendar?preview=true', '_blank')
                  return S.document().title('Opening Calendar Preview...')
                }),
              S.listItem()
                .title('Advocacy Page')
                .icon(() => '⚖️')
                .child(() => {
                  window.open('/advocacy?preview=true', '_blank')
                  return S.document().title('Opening Advocacy Preview...')
                }),
              S.listItem()
                .title('Celebration Page')
                .icon(() => '�')
                .child(() => {
                  window.open('/celebration?preview=true', '_blank')
                  return S.document().title('Opening Celebration Preview...')
                }),
              S.listItem()
                .title('Resources Page')
                .icon(() => '🌐')
                .child(() => {
                  window.open('/resources?preview=true', '_blank')
                  return S.document().title('Opening Resources Preview...')
                }),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Admin Guide')
        .icon(() => '📚')
        .child(() => {
          window.open('/admin-guide', '_blank')
          return S.document().title('Opening Admin Guide...')
        }),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'carouselImage',
        title: 'Carousel Images',
        S,
        context,
      }),
      S.listItem()
        .title('📸 Website Images')
        .schemaType('websiteImage')
        .icon(() => '🖼️')
        .child(S.documentTypeList('websiteImage').title('Website Images')),
      S.divider(),
      ...S
        .documentTypeListItems()
        .filter((listItem) => !['event', 'formLink', 'pageContent', 'resourceLink', 'carouselImage', 'websiteImage', 'calendarSettings'].includes(listItem.getId() || '')),
    ])

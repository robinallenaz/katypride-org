import { type SchemaTypeDefinition } from 'sanity'

import { calendarSettingsType } from './calendarSettingsType'
import { eventType } from './eventType'
import { formLinkType } from './formLinkType'
import { pageContentType } from './pageContentType'
import { resourceLinkType } from './resourceLinkType'
import carouselImageType from './carouselImageType'
import websiteImageType from './websiteImageType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [calendarSettingsType, eventType, formLinkType, pageContentType, resourceLinkType, carouselImageType, websiteImageType],
}

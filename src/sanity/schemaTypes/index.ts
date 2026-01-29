import { type SchemaTypeDefinition } from 'sanity'

import { coffeeMeetupOverrideType } from './coffeeMeetupOverrideType'
import { eventType } from './eventType'
import { formLinkType } from './formLinkType'
import { pageContentType } from './pageContentType'
import { resourceLinkType } from './resourceLinkType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [eventType, coffeeMeetupOverrideType, formLinkType, pageContentType, resourceLinkType],
}

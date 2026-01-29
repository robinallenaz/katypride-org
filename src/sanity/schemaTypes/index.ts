import { type SchemaTypeDefinition } from 'sanity'

import { coffeeMeetupOverrideType } from './coffeeMeetupOverrideType'
import { eventType } from './eventType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [eventType, coffeeMeetupOverrideType],
}

// Migration script to convert coffee meetup overrides to regular events
// Run this script in the Sanity Studio console or as a one-time migration

const client = require('./src/sanity/lib/client').default

async function migrateCoffeeOverrides() {
  console.log('Starting coffee overrides migration...')
  
  try {
    // Fetch all coffee meetup overrides
    const coffeeOverrides = await client.fetch(`*[_type == "coffeeMeetupOverride"]{
      _id,
      meetupDate,
      cancelled,
      title,
      start,
      end,
      location,
      address,
      directionsUrl,
      externalUrl,
      externalCtaLabel,
      image,
      summary
    }`)

    console.log(`Found ${coffeeOverrides.length} coffee overrides to migrate`)

    for (const override of coffeeOverrides) {
      if (override.cancelled) {
        console.log(`Skipping cancelled override for ${override.meetupDate}`)
        continue
      }

      // Convert override to event
      const eventData = {
        _type: 'event',
        title: override.title || 'Espresso Yourself: Community Coffee Meet-Up',
        start: override.start || `${override.meetupDate}T08:00:00.000Z`,
        end: override.end || `${override.meetupDate}T10:00:00.000Z`,
        location: override.location || 'Coffee Fellows',
        summary: override.summary,
        externalUrl: override.externalUrl,
        externalCtaLabel: override.externalCtaLabel,
        image: override.image,
        published: true,
        eventCategory: 'coffee'
      }

      try {
        // Create the new event
        const result = await client.create(eventData)
        console.log(`Created event: ${result._id} for ${override.meetupDate}`)
        
        // Delete the old override
        await client.delete(override._id)
        console.log(`Deleted old override: ${override._id}`)
        
      } catch (error) {
        console.error(`Error migrating override ${override._id}:`, error)
      }
    }

    console.log('Migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run the migration
migrateCoffeeOverrides()

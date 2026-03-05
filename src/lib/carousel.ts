import { client } from '@/sanity/lib/client'

export interface CarouselImage {
  _id: string
  title: string
  image: {
    asset: {
      _id: string
      url: string
    }
    alt?: string
  }
  isActive: boolean
  _createdAt: string
}

export async function getCarouselImages(): Promise<CarouselImage[]> {
  const query = `
    *[_type == "carouselImage" && isActive == true] | order(_createdAt asc) {
      _id,
      title,
      image {
        asset->{
          _id,
          url
        },
        alt
      },
      isActive,
      _createdAt
    }
  `
  
  // Add cache-busting to get fresh data
  return await client.fetch(query, {}, { cache: 'no-store' })
}

export async function getWebsiteImages(category?: string): Promise<any[]> {
  const categoryFilter = category ? '&& category == $category' : ''
  const query = `
    *[_type == "websiteImage" && isActive == true ${categoryFilter}] | order(name asc) {
      _id,
      name,
      image {
        asset->,
        alt
      },
      category,
      isActive,
      notes
    }
  `
  
  return await client.fetch(query, category ? { category } : {})
}

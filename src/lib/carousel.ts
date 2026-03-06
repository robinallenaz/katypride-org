import { strapiClient, type StrapiImage } from '@/lib/strapi'

export interface CarouselImage {
  id: number
  documentId: string
  title: string
  image: StrapiImage[]
  alt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/carousel-images?filters[isActive][$eq]=true&sort=createdAt:asc&populate=image`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN || ''}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch carousel images:', response.status)
      return []
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching carousel images:', error)
    return []
  }
}

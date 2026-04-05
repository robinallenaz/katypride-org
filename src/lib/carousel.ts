export interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

// Client-safe version that fetches from API
export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    const response = await fetch('/api/carousel');
    if (!response.ok) {
      throw new Error('Failed to fetch carousel data');
    }
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    return [];
  }
}

// Server-safe version for server components
export async function getCarouselImagesServer(): Promise<CarouselImage[]> {
  // Dynamic import to avoid bundling fs in client
  const { readData } = await import('./data-service');
  const data = await readData<{ images: CarouselImage[] }>('carousel');
  return data.images || [];
}

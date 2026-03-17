'use client'

import { useState, useEffect, useMemo } from 'react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getCarouselImages, type CarouselImage } from '@/lib/carousel'

// Hardcoded fallback images for development/demo
const HARDCODED_IMAGES: CarouselImage[] = [
  {
    id: 1,
    documentId: 'hardcoded-1',
    title: 'Katy Pride 2026 Celebration',
    image: [{
      id: 1,
      name: 'Katy Pride 2026 Celebration',
      alternativeText: 'Katy Pride Celebration with rainbow flags and community',
      caption: 'Katy Pride 2026 Celebration',
      width: 1200,
      height: 600,
      url: '/carousel/3-Attendees-At-Celebration.jpg',
      provider: 'hardcoded',
      provider_metadata: null,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-14T00:00:00.000Z',
      publishedAt: '2026-03-14T00:00:00.000Z'
    }],
    alt: 'Katy Pride 2026 Celebration',
    isActive: true,
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    publishedAt: '2026-03-14T00:00:00.000Z'
  },
  {
    id: 2,
    documentId: 'hardcoded-2',
    title: 'Community Unity',
    image: [{
      id: 2,
      name: 'Community Unity',
      alternativeText: 'Diverse community members celebrating together',
      caption: 'Community Unity at Katy Pride',
      width: 1200,
      height: 600,
      url: '/carousel/DJ-Krazy-V.jpg',
      provider: 'hardcoded',
      provider_metadata: null,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-14T00:00:00.000Z',
      publishedAt: '2026-03-14T00:00:00.000Z'
    }],
    alt: 'Community Unity at Katy Pride',
    isActive: true,
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    publishedAt: '2026-03-14T00:00:00.000Z'
  },
  {
    id: 3,
    documentId: 'hardcoded-3',
    title: 'Pride Parade',
    image: [{
      id: 3,
      name: 'Pride Parade',
      alternativeText: 'Colorful pride parade with participants celebrating',
      caption: 'Katy Pride Parade Celebration',
      width: 1200,
      height: 600,
      url: '/carousel/katy-pride-volunteers.jpg',
      provider: 'hardcoded',
      provider_metadata: null,
      createdAt: '2026-03-14T00:00:00.000Z',
      updatedAt: '2026-03-14T00:00:00.000Z',
      publishedAt: '2026-03-14T00:00:00.000Z'
    }],
    alt: 'Katy Pride Parade Celebration',
    isActive: true,
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    publishedAt: '2026-03-14T00:00:00.000Z'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<CarouselImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadAttempted, setLoadAttempted] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      // Prevent multiple simultaneous loads
      if (loadAttempted || isLoading) return
      setLoadAttempted(true)
      
      try {
        setIsLoading(true)
        
        // Try to load from Strapi API first, fallback to hardcoded if it fails
        let finalSlides: CarouselImage[] = []
        
        try {
          const images = await getCarouselImages()
          if (images.length > 0) {
            finalSlides = images
          } else {
            finalSlides = HARDCODED_IMAGES
          }
        } catch (apiError) {
          console.warn('Strapi API failed, using hardcoded images:', apiError)
          finalSlides = HARDCODED_IMAGES
        }
        
        // Single state update to prevent race conditions
        setSlides(finalSlides)
        setCurrentIndex(0)
        
      } catch (error) {
        console.error('Failed to load carousel images:', error)
        // Use fallback on error
        setSlides(HARDCODED_IMAGES)
        setCurrentIndex(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [loadAttempted, isLoading])

  // Define getImageUrl before using it in useMemo
  const getImageUrl = (slide: any): string => {
    // Handle Strapi image array structure
    if (slide?.image && Array.isArray(slide.image) && slide.image.length > 0) {
      const image = slide.image[0];
      if (image?.url) {
        // For hardcoded images, return URL directly from frontend public folder
        if (image.provider === 'hardcoded') {
          return image.url; // Use direct path from frontend public/carousel/
        }
        
        // Use the Strapi client's getImageUrl method for consistent URL handling
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanImageUrl = image.url.startsWith('/') ? image.url.slice(1) : image.url;
        const fullUrl = `${cleanBaseUrl}/${cleanImageUrl}`;
        return fullUrl;
      }
    }
    return '';
  }

  // Memoize image URL generation to prevent unnecessary recalculations
  const imageUrls = useMemo(() => {
    const urls: Record<string, string> = {}
    slides.forEach((slide) => {
      urls[slide.id] = getImageUrl(slide)
    })
    return urls
  }, [slides])

  const currentSlide = slides[currentIndex] || null
  const currentImageUrl = currentSlide ? imageUrls[currentSlide.id] : ''

  const goToPrevious = () => {
    if (slides.length === 0) return;
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    if (slides.length === 0) return;
    const newIndex = currentIndex === slides.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < slides.length && Number.isInteger(slideIndex)) {
      setCurrentIndex(slideIndex);
    }
  };

  const getAltText = (slide: any) => {
    return slide?.alt || slide?.title || 'Katy Pride image'
  }

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-purple-50 to-indigo-50 backdrop-blur-md rounded-2xl border border-purple-100/20 shadow-xl overflow-hidden carousel-container">
        <div className="relative w-full h-full">
          {currentSlide ? (
            <>
              {/* Static image display */}
              <div className="absolute inset-0 h-full w-full carousel-image">
                <picture>
                  <source
                    media="(min-width: 768px)"
                    srcSet={currentImageUrl}
                  />
                  <img
                    src={currentImageUrl}
                    alt={getAltText(currentSlide)}
                    className="absolute inset-0 h-full w-full object-contain carousel-image"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-100/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#760088] rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-700">Loading</span>
                  </div>
                </div>
              )}

              {/* Navigation arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white group hover:scale-105 active:scale-95"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white group hover:scale-105 active:scale-95"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Progress dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-purple-100/20">
                {slides.map((_: any, slideIndex: number) => (
                  <button
                    key={slideIndex}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-2 h-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-1 ${
                      slideIndex === currentIndex
                        ? 'bg-[#760088] w-6 shadow-lg shadow-[#760088]/50 scale-110'
                        : 'bg-white/70 hover:bg-white/90 hover:shadow-md hover:scale-125'
                    }`}
                    aria-label={`Go to slide ${slideIndex + 1}`}
                    aria-current={slideIndex === currentIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Empty state when no images */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-purple-200 text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">No Carousel Images Yet</h3>
              <p className="text-purple-600 max-w-md">
                Admins can add carousel images through the Strapi admin panel to showcase events and celebrations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getCarouselImages, type CarouselImage } from '@/lib/carousel'

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<CarouselImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true)
        const images = await getCarouselImages()
        console.log('Loaded Strapi carousel images:', images.length, images)
        setSlides(images)
        // Reset to first slide when images are loaded
        setCurrentIndex(0)
      } catch (error) {
        console.error('Failed to load carousel images:', error)
        setSlides([]) // Clear any existing images on error
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  const currentSlide = slides[currentIndex] || null

  const goToPrevious = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? slides.length - 1 : prevIndex - 1;
      return newIndex;
    });
  };

  const goToNext = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === slides.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const goToSlide = (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < slides.length && Number.isInteger(slideIndex)) {
      setCurrentIndex(slideIndex);
    }
  };

  const getImageUrl = (slide: any): string => {
    // Handle Strapi image array structure
    if (slide?.image && Array.isArray(slide.image) && slide.image.length > 0) {
      const image = slide.image[0];
      if (image?.url) {
        // Validate and construct URL safely
        if (image.url.startsWith('http')) {
          // Validate URL format
          try {
            new URL(image.url);
            return image.url;
          } catch {
            console.warn('Invalid image URL:', image.url);
            return '';
          }
        } else {
          // Construct relative URL safely
          const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
          const cleanPath = image.url.startsWith('/') ? image.url : `/${image.url}`;
          return `${baseUrl}${cleanPath}`;
        }
      }
    }
    return '';
  };

  const getAltText = (slide: any) => {
    return slide?.alt || slide?.title || 'Katy Pride image'
  }

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <div className="relative w-full h-96 md:h-[500px] bg-gradient-to-br from-purple-50 to-indigo-50/50 backdrop-blur-md rounded-2xl border border-purple-200/30 shadow-xl overflow-hidden">
        <div className="relative w-full h-full">
          {currentSlide ? (
            <>
              {/* Main image */}
              <picture>
                <source
                  media="(min-width: 768px)"
                  srcSet={getImageUrl(currentSlide)}
                />
                <img
                  src={getImageUrl(currentSlide)}
                  alt={getAltText(currentSlide)}
                  className="absolute inset-0 h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </picture>

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-700">Loading</span>
                  </div>
                </div>
              )}

              {/* Navigation arrows */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white group"
                aria-label="Previous slide"
              >
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white group"
                aria-label="Next slide"
              >
                <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Progress dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full">
                {slides.map((_: any, slideIndex: number) => (
                  <button
                    key={slideIndex}
                    onClick={() => goToSlide(slideIndex)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-1 ${
                      slideIndex === currentIndex
                        ? 'bg-purple-600 w-6'
                        : 'bg-white/70 hover:bg-white'
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

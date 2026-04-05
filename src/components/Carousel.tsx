'use client'

import { useState, useEffect, useRef } from 'react'

interface CarouselImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

// Hardcoded fallback images for development/demo
const HARDCODED_IMAGES: CarouselImage[] = [
  {
    id: '1',
    url: '/carousel/3-Attendees-At-Celebration.jpg',
    alt: 'Katy Pride Celebration with rainbow flags and community',
    caption: 'Katy Pride 2026 Celebration'
  },
  {
    id: '2',
    url: '/carousel/DJ-Krazy-V.jpg',
    alt: 'DJ Krazy V performing at Katy Pride',
    caption: 'DJ Krazy V keeping the energy high'
  },
  {
    id: '3',
    url: '/carousel/katy-pride-volunteers.jpg',
    alt: 'Katy Pride volunteers',
    caption: 'Our amazing volunteers make it all possible'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<CarouselImage[]>(HARDCODED_IMAGES)
  const [isLoading, setIsLoading] = useState(false)
  const loadAttemptedRef = useRef(false)

  useEffect(() => {
    const loadImages = async () => {
      if (loadAttemptedRef.current) return
      loadAttemptedRef.current = true
      
      try {
        setIsLoading(true)
        
        // Try to load from JSON file first, fallback to hardcoded if it fails
        let finalSlides: CarouselImage[] = []
        
        try {
          const response = await fetch('/api/carousel')
          if (!response.ok) throw new Error('Failed to fetch')
          const data = await response.json()
          if (data.images && data.images.length > 0) {
            finalSlides = data.images
          } else {
            finalSlides = HARDCODED_IMAGES
          }
        } catch (apiError) {
          console.warn('JSON load failed, using hardcoded images:', apiError)
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
  }, [])

  const currentSlide = slides[currentIndex] || null

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
                    srcSet={currentSlide.url}
                  />
                  <img
                    src={currentSlide.url}
                    alt={currentSlide.alt || 'Katy Pride image'}
                    className="absolute inset-0 h-full w-full object-contain carousel-image"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>

              {/* Caption */}
              {currentSlide.caption && (
                <div className="absolute bottom-16 left-0 right-0 bg-black/50 text-white text-center py-2 px-4">
                  <p className="text-sm font-medium">{currentSlide.caption}</p>
                </div>
              )}

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
                Admins can add carousel images through the admin panel at /admin/carousel to showcase events and celebrations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

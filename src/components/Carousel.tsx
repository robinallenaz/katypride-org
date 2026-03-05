'use client'

import { useState, useEffect } from 'react'
import { cloudinaryUrl } from '@/lib/cloudinary'
import { getCarouselImages, type CarouselImage } from '@/lib/carousel'

// Fallback images for instant loading
const fallbackSlides = [
  {
    id: 1,
    src: '6602f1822977211510fc70c0_tluarb',
    alt: 'Katy Pride celebration',
  },
  {
    id: 2,
    src: '6602f1822977211510fc70c0_tluarb',
    alt: 'Community event',
  },
  {
    id: 3,
    src: '6602f1822977211510fc70c0_tluarb',
    alt: 'Volunteers at Katy Pride',
  },
  {
    id: 4,
    src: '6602f1822977211510fc70c0_tluarb',
    alt: 'Pride parade',
  },
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slides, setSlides] = useState<CarouselImage[]>([])
  const [isUsingFallback, setIsUsingFallback] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true)
        const images = await getCarouselImages()
        if (images.length > 0) {
          setSlides(images)
          setIsUsingFallback(false)
          // Reset to first slide when switching to admin images
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error('Failed to load carousel images:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  const currentSlides = isUsingFallback ? fallbackSlides : slides
  const currentSlide = currentSlides[currentIndex] || fallbackSlides[0]

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? currentSlides.length - 1 : prevIndex - 1
      return Math.max(0, Math.min(newIndex, currentSlides.length - 1))
    })
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === currentSlides.length - 1 ? 0 : prevIndex + 1
      return Math.max(0, Math.min(newIndex, currentSlides.length - 1))
    })
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  const getImageUrl = (slide: any) => {
    return isUsingFallback ? cloudinaryUrl(slide.src, 1200) : slide?.image?.asset?.url || cloudinaryUrl('65ad7fd64707829ac5cdbe0d_epa64u', 1200)
  }

  const getAltText = (slide: any) => {
    if (isUsingFallback) {
      return slide.alt
    }
    return slide?.image?.alt || slide?.title || 'Katy Pride image'
  }

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <div className="relative w-full h-96 md:h-[500px] bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 shadow-xl overflow-hidden">
        <div className="relative w-full h-full bg-purple-50">
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
              loading={isUsingFallback ? 'eager' : 'lazy'}
              decoding="async"
            />
          </picture>

          {/* Loading indicator */}
          {isLoading && !isUsingFallback && (
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
            {currentSlides.map((_, slideIndex) => (
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

                  </div>
      </div>
    </div>
  )
}

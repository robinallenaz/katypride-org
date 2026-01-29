'use client'

import { useState } from 'react'
import { cloudinaryUrl } from '@/lib/cloudinary'

const slides = [
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

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
      <div className="relative w-full h-96 md:h-[500px] bg-white/80 backdrop-blur-md rounded-2xl border border-black/5 shadow-xl overflow-hidden">
        <div className="relative w-full h-full">
          <img
            src={cloudinaryUrl(slides[currentIndex].src, 2000)}
            alt={slides[currentIndex].alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          
          {/* Left arrow */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right arrow */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, slideIndex) => (
              <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                className={`w-3 h-3 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#760088] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  slideIndex === currentIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${slideIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

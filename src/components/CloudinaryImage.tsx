'use client'

import Image from 'next/image'
import { cloudinaryLoader, generateSrcSet, SIZES, cloudinaryUrl } from '@/lib/cloudinary'

interface CloudinaryImageProps {
  src: string
  alt: string
  width: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number | 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low'
  fill?: boolean
  style?: React.CSSProperties
}

/**
 * CloudinaryImage - A Next.js Image component with automatic Cloudinary optimization
 * 
 * Features:
 * - Automatic f_auto (format) and q_auto:good (quality) transformations
 * - Responsive srcset generation
 * - Falls back to regular img for local/static images
 * - Uses Next.js Image for optimal loading performance
 */
export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = 'auto:good',
  fill = false,
  style,
}: CloudinaryImageProps) {
  // For local/static images, use regular img
  if (src.startsWith('/') && !src.startsWith('//')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  // For Cloudinary images, use Next.js Image with custom loader
  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      style={style}
      priority={priority}
      sizes={sizes || `${width}px`}
      quality={typeof quality === 'number' ? quality : 80}
      loader={cloudinaryLoader}
    />
  )
}

/**
 * CloudinaryResponsiveImage - Image with responsive breakpoints
 * 
 * Provides automatic srcset for different screen sizes
 */
export function CloudinaryResponsiveImage({
  src,
  alt,
  widths = [320, 640, 960, 1280, 1920],
  className,
  priority = false,
  sizes = SIZES.fullWidth,
  quality = 'auto:good',
}: {
  src: string
  alt: string
  widths?: number[]
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number | 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low'
}) {
  // For local images, use regular img with srcset if available
  if (src.startsWith('/') && !src.startsWith('//')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }

  const srcSet = generateSrcSet(src, widths, { quality })

  return (
    <img
      src={cloudinaryUrl(src, widths[Math.floor(widths.length / 2)], { quality })}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      srcSet={srcSet}
      sizes={sizes}
    />
  )
}


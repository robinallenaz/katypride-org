import { ImageLoader } from 'next/image'

const HARDCODED_CLOUD_NAME = 'dpus8jzix'
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

// Environment validation
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== HARDCODED_CLOUD_NAME) {
  console.warn(
    `[Cloudinary] Cloud name mismatch detected!\n` +
    `  Environment: ${CLOUDINARY_CLOUD_NAME}\n` +
    `  Hardcoded:   ${HARDCODED_CLOUD_NAME}\n` +
    `  Using hardcoded value. Images may fail to load if cloud names differ.`
  )
}

const CLOUD_NAME = HARDCODED_CLOUD_NAME

function isCloudinaryUrl(src: string): boolean {
  return src.startsWith('https://res.cloudinary.com/')
}

/**
 * Extract public ID from a Cloudinary URL
 * Handles both raw public IDs and full Cloudinary URLs with transformations
 */
function extractPublicId(src: string): string {
  // If it's already a full Cloudinary URL, extract the public ID
  if (isCloudinaryUrl(src)) {
    const url = new URL(src)
    const pathParts = url.pathname.split('/')
    // URL structure: /cloud_name/image/upload/[transformations/]version/public_id
    // Find the 'upload' segment
    const uploadIndex = pathParts.indexOf('upload')
    if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
      const afterUpload = pathParts.slice(uploadIndex + 1)

      // Prefer version-based extraction (most reliable for uploaded assets)
      const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part))
      if (versionIndex !== -1 && versionIndex + 1 < afterUpload.length) {
        return afterUpload.slice(versionIndex + 1).join('/')
      }

      // Fallback: if no version is present, only strip clearly-known transformation prefixes.
      // If uncertain, return original src to avoid corrupting public IDs.
      const knownTransformPrefixes = ['c_', 'w_', 'h_', 'g_', 'q_', 'f_', 'dpr_', 'ar_', 'e_', 'fl_', 'bo_', 'a_', 'o_', 'b_']
      let startIndex = 0
      while (startIndex < afterUpload.length) {
        const part = afterUpload[startIndex]
        const looksLikeTransform = part.includes(',') || knownTransformPrefixes.some((prefix) => part.startsWith(prefix))
        if (!looksLikeTransform) break
        startIndex += 1
      }

      if (startIndex < afterUpload.length) {
        return afterUpload.slice(startIndex).join('/')
      }
    }
  }
  return src
}

export const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  // Don't transform local/static images
  if (src.startsWith('/') && !src.startsWith('//')) {
    return src
  }

  // Don't transform external non-Cloudinary URLs
  if (!isCloudinaryUrl(src) && /^https?:\/\//.test(src)) {
    return src
  }

  // Extract public ID from Cloudinary URLs to allow re-transformation
  const publicId = extractPublicId(src)

  // Use 'auto:good' as default if quality is undefined
  const q = quality || 'auto:good'
  // Convert numeric quality to string for URL
  const qStr = typeof q === 'number' ? q.toString() : q

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},c_scale/f_auto/q_${qStr}/${publicId}`
}

export const cloudinaryUrl = (src: string, width: number, options?: {
  quality?: number | 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low'
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'north_west' | 'north_east' | 'south_west' | 'south_east'
}): string => {
  // Return as-is for local/static images
  if (src.startsWith('/') && !src.startsWith('//')) {
    return src
  }

  // Don't transform external non-Cloudinary URLs
  if (!isCloudinaryUrl(src) && /^https?:\/\//.test(src)) {
    return src
  }

  // Extract public ID from Cloudinary URLs to allow re-transformation with new params
  const publicId = extractPublicId(src)

  const { quality = 'auto:good', height, crop = 'fill', gravity = 'auto' } = options || {}

  // Build transformation components (separate by slashes per Cloudinary best practice)
  const components: string[] = []

  // Size/crop transformations come first (if height is specified)
  if (height) {
    // e.g., c_fill,g_auto,w_800,h_600
    const cropTransforms = [`c_${crop}`, `w_${width}`, `h_${height}`]
    // Only add gravity for crop modes that support it (per Cloudinary docs)
    // g_auto works with: c_fill, c_lfill, c_crop, c_thumb, c_auto
    // Does NOT work with: c_scale, c_fit
    if (crop !== 'scale' && crop !== 'fit') {
      cropTransforms.push(`g_${gravity}`)
    }
    components.push(cropTransforms.join(','))
  } else {
    // Just width scaling: w_800,c_scale
    // Note: g_auto doesn't work with c_scale per Cloudinary docs
    components.push(`w_${width},c_scale`)
  }

  // Quality and format always at the end as separate components (Cloudinary best practice)
  const qStr = typeof quality === 'number' ? quality.toString() : quality
  components.push('f_auto')
  components.push(`q_${qStr}`)

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${components.join('/')}/${publicId}`
}

// Generate responsive srcset for different breakpoints
export const generateSrcSet = (
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options?: Parameters<typeof cloudinaryUrl>[2]
): string => {
  // Skip for local images
  if (src.startsWith('/') && !src.startsWith('//')) {
    return ''
  }

  // Cannot generate Cloudinary variants for external non-Cloudinary URLs
  if (!isCloudinaryUrl(src) && /^https?:\/\//.test(src)) {
    return ''
  }

  // Extract public ID once for consistency across all widths
  const publicId = extractPublicId(src)

  return widths
    .map((w) => {
      // For srcset, maintain aspect ratio by scaling width only (no height)
      // Unless explicit height is provided in options
      const url = options?.height
        ? cloudinaryUrl(publicId, w, options)
        : cloudinaryUrl(publicId, w, { ...options, height: undefined })
      return `${url} ${w}w`
    })
    .join(', ')
}

// Common breakpoints for responsive images
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Predefined sizes for common use cases
export const SIZES = {
  carousel: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px',
  hero: '100vw',
  thumbnail: '(max-width: 640px) 50vw, 200px',
  fullWidth: '100vw',
} as const

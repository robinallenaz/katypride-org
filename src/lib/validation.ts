/**
 * Shared validation utilities for admin forms
 */

// File validation constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate image URL to prevent XSS attacks
 * Allows relative paths (starting with /) and HTTPS URLs only
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  // Allow relative paths starting with / (but not // which is protocol-relative)
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  // Allow https URLs only (no http to avoid mixed content)
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate file type for image uploads
 * Checks both MIME type and extension
 */
export function isValidImageFile(file: File): boolean {
  const lastDot = file.name.lastIndexOf('.');
  const ext = lastDot === -1 ? '' : file.name.toLowerCase().slice(lastDot);
  return ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number]) &&
         ALLOWED_IMAGE_EXTENSIONS.includes(ext as typeof ALLOWED_IMAGE_EXTENSIONS[number]);
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSize: number = MAX_FILE_SIZE): boolean {
  return file.size <= maxSize;
}

/**
 * Get file validation error message
 */
export function getFileValidationError(file: File): string | null {
  if (!isValidImageFile(file)) {
    return 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.';
  }
  if (!isValidFileSize(file)) {
    return 'File too large. Maximum size is 5MB.';
  }
  return null;
}

/**
 * Generate a unique ID with collision resistance
 * Combines timestamp with random string
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `${timestamp}-${random}`;
}

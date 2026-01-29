import { ImageLoader } from 'next/image'

export const cloudinaryLoader: ImageLoader = ({ src, width, quality }) => {
  return `https://res.cloudinary.com/dpus8jzix/image/upload/f_auto,q_${quality || 80},w_${width}/${src}`
}

export const cloudinaryUrl = (src: string, width: number, quality?: number) => {
  return `https://res.cloudinary.com/dpus8jzix/image/upload/f_auto,q_${quality || 80},w_${width}/${src}`
}

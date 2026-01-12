'use client'

import { useEffect, useState } from 'react'
import FallbackImage from '@/components/common/Image/FallbackImage'

type ProductImageSliderProps = {
  images: string[]
  name: string
  interval?: number
}

export default function ProductImageSlider({
  images,
  name,
  interval = 2000,
}: ProductImageSliderProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!images || images.length <= 1 || paused) return

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(id)
  }, [images, interval, paused])

  if (!images || images.length === 0) return null

  return (
    <div
      className="absolute inset-0 bg-gray-100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <FallbackImage
        key={index}
        src={images[index]}
        alt={name}
        fill
        className="object-cover transition-opacity duration-500"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

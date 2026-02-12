'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, Star, X } from 'lucide-react'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { Product } from '@/types/product'

interface ProductImageGalleryProps {
  images: string[]
  product: Product
  selectedImage: number
  setSelectedImage: (index: number) => void
  nextImage: () => void
  prevImage: () => void
  lightboxOpen: boolean
  setLightboxOpen: (open: boolean) => void
}

const ProductImageGallery = memo(({
  images,
  product,
  selectedImage,
  setSelectedImage,
  nextImage,
  prevImage,
  lightboxOpen,
  setLightboxOpen
}: ProductImageGalleryProps) => {
  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-square rounded-3xl overflow-hidden bg-white/50 dark:bg-black/50 border border-foreground/5 shadow-inner cursor-pointer group"
          onClick={(e) => {
            if (images.length > 1) {
              e.stopPropagation()
              nextImage()
            } else {
              setLightboxOpen(true)
            }
          }}
        >
          <FallbackImage
            src={images[selectedImage]}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.discount && (
              <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20">
                {product.discount}% OFF
              </span>
            )}
            {((typeof product.unitsPerPack === 'number' && product.unitsPerPack > 1) || product.name.toLowerCase().includes('combo')) && (
              <span className="bg-white/95 dark:bg-violet-600/90 backdrop-blur-md text-violet-700 dark:text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-violet-500/20 border border-violet-200/50 dark:border-violet-500/50">
                {product.name.toLowerCase().includes('combo') ? 'COMBO OFFER' : `PACK OF ${product.unitsPerPack}`}
              </span>
            )}
          </div>

          {product.rating && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-brand-purple text-brand-purple" />
              <span>{product.rating}</span>
              <span className="text-white/60 font-normal ml-1">
                ({product.reviews ?? 0})
              </span>
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
            className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === idx
                    ? 'border-brand-purple ring-2 ring-brand-purple/20'
                    : 'border-transparent hover:border-brand-purple/50'
                }`}
              >
                <FallbackImage
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <FallbackImage
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
})

ProductImageGallery.displayName = 'ProductImageGallery'

export default ProductImageGallery

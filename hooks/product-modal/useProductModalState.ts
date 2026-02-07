import { useState, useCallback } from 'react'
import { Product } from '@/types/product'

interface UseProductModalStateProps {
  product: Product
}

export function useProductModalState({ product }: UseProductModalStateProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews'>('desc')

  const images: string[] = (product.images && product.images.length > 0)
    ? product.images
    : [product.image]

  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleQuantityChange = useCallback((type: 'inc' | 'dec') => {
    const maxQty = product.price >= 1000 ? 2 : 3
    setQuantity((prev) => {
      if (type === 'inc') return Math.min(prev + 1, maxQty)
      return Math.max(1, prev - 1)
    })
  }, [product.price])

  return {
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    selectedColor,
    setSelectedColor,
    lightboxOpen,
    setLightboxOpen,
    activeTab,
    setActiveTab,
    images,
    nextImage,
    prevImage,
    handleQuantityChange,
    maxQty: product.price >= 1000 ? 2 : 3
  }
}

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Product } from '@/types/product'
import { getProductPath } from '@/utils/productUtils'

interface UseProductActionsProps {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
  onAddToCart: (product: Product & { quantity: number; selectedSize?: string; selectedColor?: string }) => void
  onClose: () => void
}

export function useProductActions({
  product,
  quantity,
  selectedSize,
  selectedColor,
  onAddToCart,
  onClose
}: UseProductActionsProps) {
  const router = useRouter()

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}${getProductPath(product.name, product.id)}`
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on FirgoMart!`,
      url
    }

    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Product link copied to clipboard!')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
        toast.error('Failed to copy link')
      }
    }
  }, [product.id, product.name])

  const validateSelection = useCallback(() => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return false
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color')
      return false
    }
    return true
  }, [product.sizes, product.colors, selectedSize, selectedColor])

  const handleBuyNow = useCallback(() => {
    if ((product.stock ?? 0) > 0) {
      if (!validateSelection()) return
      onAddToCart({ 
        ...product, 
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined
      })
      onClose()
      router.push('/checkout')
    }
  }, [product, quantity, selectedSize, selectedColor, validateSelection, onAddToCart, onClose, router])

  return {
    handleShare,
    handleBuyNow,
    validateSelection
  }
}

import { useEffect, useMemo } from 'react'
import { Product } from '@/types/product'

interface UseProductMetadataProps {
  product: Product
}

export function useProductMetadata({ product }: UseProductMetadataProps) {
  useEffect(() => {
    const prevTitle = document.title
    const descTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    const keysTag = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null
    const prevDesc = descTag?.content || ''
    const prevKeys = keysTag?.content || ''

    const words = String(product.name || '').split(/\s+/).filter(Boolean)
    const colorKeys = (product.colors || []).map(String)
    const sizeKeys = (product.sizes || []).map(String)
    const cat = String(product.category || '')
    const brand = String(product.brand || '')
    const ratingWord = (product.rating && product.rating >= 4.5) ? 'top rated' : ''
    const discountWord = (product.discount && product.discount >= 25) ? 'best deal' : ''
    const trendWord = 'trending'
    
    const keywords = [
      ...words,
      brand,
      cat,
      ...colorKeys,
      ...sizeKeys,
      ratingWord,
      discountWord,
      trendWord,
    ].filter(Boolean).join(', ')
    
    const shortDesc = String(product.description || `${brand ? brand + ' ' : ''}${product.name}` || '').slice(0, 240)
    
    document.title = `${product.name} | FirgoMart`
    if (descTag) descTag.content = shortDesc
    if (keysTag) keysTag.content = keywords
    
    return () => {
      document.title = prevTitle
      if (descTag) descTag.content = prevDesc
      if (keysTag) keysTag.content = prevKeys
    }
  }, [product])

  const productSchema = useMemo(() => {
    const images = (product.images && product.images.length > 0) ? product.images : [product.image]
    const imageUrls = images.map((src) => String(src))
    const offers = {
      '@type': 'Offer',
      priceCurrency: typeof product.currencyCode === 'string' && product.currencyCode ? product.currencyCode : 'INR',
      price: Number(product.price || 0),
      availability: (product.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : 'https://firgomart.com',
    }
    const aggregateRating = (typeof product.rating === 'number' && product.rating > 0)
      ? { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: Number(product.reviews || 0) }
      : undefined
      
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: imageUrls,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      category: product.category,
      color: (product.colors || []).join(', '),
      size: (product.sizes || []).join(', '),
      description: product.description || undefined,
      offers,
      aggregateRating,
    }
  }, [product])

  return { productSchema }
}

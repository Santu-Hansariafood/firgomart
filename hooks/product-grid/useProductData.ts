import { useState, useCallback, useEffect } from 'react'
import { Product } from '@/types/product'
import { Offer } from '@/components/ui/Filters/OffersFilterChips'
import { sanitizeImageUrl } from '@/utils/productUtils'

type ApiProduct = {
    _id?: string | number
    id?: string | number
    name: string
    image?: string
    images?: string[]
    category: string
    subcategory?: string
    price: number
    originalPrice?: number
    discount?: number
    rating?: number
    brand?: string
    colors?: string[]
    sizes?: string[]
    about?: string
    additionalInfo?: string
    description?: string
    reviews?: number
    stock?: number
    unitsPerPack?: number
    isAdminProduct?: boolean
    hsnCode?: string
}

interface UseProductDataProps {
  search: string
  category: string
  subcategory: string
  deliverToState: string
  sortBy: string
  minPrice: string
  maxPrice: string
  minRating: number | null
  selectedSize: string
  selectedOffer: string
  selectedOfferDetails: Offer | null
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export function useProductData({
  search, category, subcategory, deliverToState, sortBy,
  minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails,
  page, setPage
}: UseProductDataProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const productsPerPage = 24

  const shuffleArray = (array: Product[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const stateParam = deliverToState ? `&deliverToState=${encodeURIComponent(deliverToState)}` : ''
      const adminParam = !deliverToState ? `&adminOnly=true` : ''
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const categoryParam = category ? `&category=${encodeURIComponent(category)}` : ''
      const subcategoryParam = subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ''
      const sortParam = sortBy !== 'relevance' ? `&sortBy=${encodeURIComponent(sortBy)}` : ''
      const priceParam = minPrice || maxPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''
      const ratingParam = minRating ? `&minRating=${minRating}` : ''
      const sizeParam = selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ''
      const offerParam = selectedOffer ? `&offer=${encodeURIComponent(selectedOffer)}` : ''
      
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${adminParam}${searchParam}${categoryParam}${subcategoryParam}${sortParam}${priceParam}${ratingParam}${sizeParam}${offerParam}`)
      
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      
      return list.map((p: ApiProduct) => ({
        id: p._id || p.id,
        name: p.name,
        image: sanitizeImageUrl(Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || ''),
        images: Array.isArray(p.images) ? p.images : undefined,
        category: p.category,
        subcategory: p.subcategory,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        rating: p.rating,
        brand: p.brand,
        colors: p.colors,
        sizes: p.sizes,
        about: p.about,
        additionalInfo: p.additionalInfo,
        description: p.description,
        reviews: p.reviews,
        stock: p.stock,
        unitsPerPack: p.unitsPerPack,
        isAdminProduct: p.isAdminProduct,
        hsnCode: p.hsnCode,
        appliedOffer: (selectedOfferDetails && (
          (!selectedOfferDetails.category || selectedOfferDetails.category === p.category) &&
          (!selectedOfferDetails.subcategory || selectedOfferDetails.subcategory === p.subcategory)
        )) ? {
          name: selectedOfferDetails.name,
          type: selectedOfferDetails.type,
          value: selectedOfferDetails.value
        } : undefined
      })) as Product[]
    } catch {
      return []
    }
  }, [deliverToState, search, category, subcategory, sortBy, minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails])

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      setDisplayedProducts([]) 
      const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
      let initial = [...first, ...second]
      
      if (sortBy === 'relevance' && !search) {
        initial = shuffleArray(initial)
      }
      
      setDisplayedProducts(initial)
      setPage(2)
      setHasMore(second.length === productsPerPage)
      setLoading(false)
    }
    loadInitial()
  }, [fetchPage, search, sortBy]) 
  
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)
    ;(async () => {
      const nextPage = page + 1
      const next = await fetchPage(nextPage)
      setDisplayedProducts(prev => [...prev, ...next])
      setPage(nextPage)
      setHasMore(next.length === productsPerPage)
      setLoading(false)
    })()
  }, [page, loading, hasMore, fetchPage])

  return {
    displayedProducts,
    setDisplayedProducts,
    page,
    setPage,
    loading,
    hasMore,
    loadMore
  }
}

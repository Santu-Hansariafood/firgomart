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
  countryCode: string
  sortBy: string
  minPrice: string
  maxPrice: string
  minRating: number | null
  selectedSize: string
  selectedOffer: string
  selectedOfferDetails: Offer | null
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  newArrivals?: boolean
  adminOnly?: boolean
  sellerOnly?: boolean
}

export function useProductData({
  search, category, subcategory, deliverToState, countryCode, sortBy,
  minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails,
  page, setPage, newArrivals, adminOnly, sellerOnly
}: UseProductDataProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [fallbackLabel, setFallbackLabel] = useState<string | null>(null)
  const productsPerPage = 24

  const shuffleArray = (array: Product[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const mapApiProducts = (list: ApiProduct[]): Product[] => {
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
  }

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const stateParam = deliverToState ? `&deliverToState=${encodeURIComponent(deliverToState)}` : ''
      const countryParam = countryCode ? `&country=${encodeURIComponent(countryCode)}` : ''
      
      const shouldDefaultToAdmin = !deliverToState && !search && !sellerOnly && adminOnly !== false
      
      const adminParam = (adminOnly || shouldDefaultToAdmin) ? `&adminOnly=true` : ''
      const sellerParam = sellerOnly ? `&sellerOnly=true` : ''
      
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const categoryParam = category ? `&category=${encodeURIComponent(category)}` : ''
      const subcategoryParam = subcategory ? `&subcategory=${encodeURIComponent(subcategory)}` : ''
      const sortParam = sortBy !== 'relevance' ? `&sortBy=${encodeURIComponent(sortBy)}` : ''
      const priceParam = minPrice || maxPrice ? `&minPrice=${minPrice}&maxPrice=${maxPrice}` : ''
      const ratingParam = minRating ? `&minRating=${minRating}` : ''
      const sizeParam = selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ''
      const offerParam = selectedOffer ? `&offer=${encodeURIComponent(selectedOffer)}` : ''
      const newArrivalsParam = newArrivals ? '&newArrivals=true' : ''
      
      const res = await fetch(`/api/products?limit=${productsPerPage}&page=${pageNum}${stateParam}${countryParam}${adminParam}${sellerParam}${searchParam}${categoryParam}${subcategoryParam}${sortParam}${priceParam}${ratingParam}${sizeParam}${offerParam}${newArrivalsParam}`)
      
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data.products) ? data.products : []
      return mapApiProducts(list)
    } catch {
      return []
    }
  }, [deliverToState, countryCode, search, category, subcategory, sortBy, minPrice, maxPrice, minRating, selectedSize, selectedOffer, selectedOfferDetails, newArrivals, adminOnly, sellerOnly])

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true)
      setFallbackLabel(null)
      setDisplayedProducts([]) 
      const [first, second] = await Promise.all([fetchPage(1), fetchPage(2)])
      let initial = [...first, ...second]
      
      if (sortBy === 'relevance' && !search) {
        initial = shuffleArray(initial)
      }

      if (initial.length === 0) {
        const stateParam = deliverToState ? `&deliverToState=${encodeURIComponent(deliverToState)}` : ''
        const countryParam = countryCode ? `&country=${encodeURIComponent(countryCode)}` : ''
        const shouldDefaultToAdmin = !deliverToState && !search && !sellerOnly && adminOnly !== false
        const adminParam = (adminOnly || shouldDefaultToAdmin) ? `&adminOnly=true` : ''
        const sellerParam = sellerOnly ? `&sellerOnly=true` : ''

        let fallback: Product[] = []

        if (category) {
          try {
            const resCat = await fetch(`/api/products?limit=${productsPerPage * 2}&page=1${stateParam}${countryParam}${adminParam}${sellerParam}&category=${encodeURIComponent(category)}`)
            if (resCat.ok) {
              const dataCat = await resCat.json()
              const listCat = Array.isArray(dataCat.products) ? dataCat.products : []
              fallback = mapApiProducts(listCat as ApiProduct[])
            }
          } catch {}

          if (fallback.length > 0) {
            initial = fallback
            setFallbackLabel('Showing similar products in this category')
          }
        }

        if (initial.length === 0) {
          try {
            const resAll = await fetch(`/api/products?limit=${productsPerPage * 2}&page=1${stateParam}${countryParam}${adminParam}${sellerParam}`)
            if (resAll.ok) {
              const dataAll = await resAll.json()
              const listAll = Array.isArray(dataAll.products) ? dataAll.products : []
              const allProducts = mapApiProducts(listAll as ApiProduct[])
              if (allProducts.length > 0) {
                initial = allProducts
                setFallbackLabel('Showing similar products from all categories')
              }
            }
          } catch {}
        }

        if (initial.length > 0) {
          setHasMore(false)
        }
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
    loadMore,
    fallbackLabel
  }
}

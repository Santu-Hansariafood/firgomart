import { useState, useCallback } from 'react'
import { Offer } from '@/components/ui/Filters/OffersFilterChips'

export function useProductFilters(setPage: (page: number) => void) {
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [activeFilterTab, setActiveFilterTab] = useState<string | null>(null)
  
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Offer | null>(null)

  const handlePriceCategorySelect = useCallback((min: number, max: number, type?: string) => {
    setMinRating(null)
    setSelectedSize('')
    setSelectedOffer('')
    setSelectedOfferDetails(null)
    
    if (type === 'discount') {
      setMinPrice('')
      setMaxPrice('')
      setSortBy('price-asc')
    } else if (type === 'special') {
      setMinPrice('')
      setMaxPrice('')
      setSortBy('relevance')
    } else {
      setMinPrice(String(min))
      setMaxPrice(String(max))
      setSortBy('price-asc')
    }
    setPage(1)
  }, [setPage])

  const clearAllFilters = useCallback(() => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating(null)
    setSelectedSize('')
    setSelectedOffer('')
    setSelectedOfferDetails(null)
    setPage(1)
  }, [setPage])

  return {
    sortBy, setSortBy,
    isSortDropdownOpen, setIsSortDropdownOpen,
    isFilterOpen, setIsFilterOpen,
    activeFilterTab, setActiveFilterTab,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    minRating, setMinRating,
    selectedSize, setSelectedSize,
    selectedOffer, setSelectedOffer,
    selectedOfferDetails, setSelectedOfferDetails,
    handlePriceCategorySelect,
    clearAllFilters
  }
}

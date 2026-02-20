"use client"

import { motion } from "framer-motion"
import { ChevronDown, SlidersHorizontal, Star, IndianRupee, Maximize2 } from "lucide-react"
import { useEffect, useRef, memo, useState } from "react"

export type DropdownItem = {
  id: string | number
  label: string
}

interface FilterControlsProps {
  isFilterOpen: boolean
  setIsFilterOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  activeFilterTab: string | null
  setActiveFilterTab: (v: string | null) => void
  isSortDropdownOpen: boolean
  setIsSortDropdownOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  sortBy: string
  setSortBy: (v: string) => void
  minPrice: string
  maxPrice: string
  minRating: number | null
  selectedSize: string
  setPage: (v: number) => void
}

interface FilterPanelProps {
  activeFilterTab: string | null
  minPrice: string
  setMinPrice: (v: string) => void
  maxPrice: string
  setMaxPrice: (v: string) => void
  minRating: number | null
  setMinRating: (v: number | null) => void
  selectedSize: string
  setSelectedSize: (v: string) => void
  setPage: (v: number) => void
  onClearFilters: () => void
  category: string
  getSizeOptionsForCategory: (cat: string) => DropdownItem[]
  allSizes: DropdownItem[]
}

export const FilterControls = memo(function FilterControls({
  isFilterOpen,
  setIsFilterOpen,
  activeFilterTab,
  setActiveFilterTab,
  isSortDropdownOpen,
  setIsSortDropdownOpen,
  sortBy,
  setSortBy,
  minPrice,
  maxPrice,
  minRating,
  selectedSize,
  setPage,
}: FilterControlsProps) {
  const hasFilters = Boolean(
    minPrice || maxPrice || minRating || selectedSize
  )

  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setIsSortDropdownOpen])

  return (
    <div className="relative z-[60] flex flex-row items-center justify-end gap-2 sm:gap-4 w-full">
      <button
        onClick={() => setIsFilterOpen((p) => !p)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full text-sm font-semibold transition-all border
          ${
            isFilterOpen || hasFilters
              ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20"
              : "bg-white/80 dark:bg-background/80 border-gray-200 dark:border-foreground/20 hover:bg-gray-50 dark:hover:bg-foreground/5 text-foreground backdrop-blur-sm"
          }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden xs:inline">Filters</span>
        {hasFilters && (
          <span className="flex items-center justify-center w-5 h-5 ml-1 text-[10px] bg-white text-brand-purple rounded-full font-bold">
            {[!!minPrice || !!maxPrice, !!minRating, !!selectedSize].filter(Boolean).length}
          </span>
        )}
      </button>

      <div ref={sortRef} className="relative z-[70]">
        <button
          onClick={() => setIsSortDropdownOpen((p) => !p)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-full bg-white/80 dark:bg-background/80 border border-gray-200 dark:border-foreground/20 text-sm font-medium hover:bg-gray-50 dark:hover:bg-foreground/5 transition-all backdrop-blur-sm text-foreground min-w-[140px] sm:min-w-[180px] justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider hidden sm:inline">Sort:</span>
            <span className="font-semibold text-gray-900 dark:text-white truncate">
              {sortBy === "relevance"
                ? "Relevance"
                : sortBy === "price-asc"
                ? "Price: Low to High"
                : sortBy === "price-desc"
                ? "Price: High to Low"
                : "Top Rated"}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
              isSortDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isSortDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute right-0 mt-2 w-48 sm:w-56 rounded-xl bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-xl overflow-hidden z-[80] origin-top-right"
          >
            {[
              ["relevance", "Relevance"],
              ["price-asc", "Price: Low to High"],
              ["price-desc", "Price: High to Low"],
              ["rating", "Top Rated"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => {
                  setSortBy(value)
                  setIsSortDropdownOpen(false)
                  setPage(1)
                }}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all
                  ${
                    sortBy === value
                      ? "bg-brand-purple text-white font-semibold"
                      : "text-foreground hover:bg-foreground/5"
                  }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
})

export const FilterPanel = memo(function FilterPanel({
  activeFilterTab,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  selectedSize,
  setSelectedSize,
  setPage,
  onClearFilters,
  category,
  getSizeOptionsForCategory,
  allSizes,
}: FilterPanelProps) {
  const [mobileTab, setMobileTab] = useState<'price' | 'size' | 'rating'>('price')

  const sizeOptions = category ? getSizeOptionsForCategory(category) : allSizes
  const hasSize = sizeOptions.length > 0

  const MIN_PRICE_LIMIT = 0
  const MAX_PRICE_LIMIT = category === "Mobile & Electronics" ? 200000 : 5000
  
  const currentMin = minPrice ? parseInt(minPrice) : MIN_PRICE_LIMIT
  const currentMax = maxPrice ? parseInt(maxPrice) : MAX_PRICE_LIMIT

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseInt(e.target.value)
    if (type === 'min') {
      if (value <= currentMax) {
        setMinPrice(value.toString())
        setPage(1)
      }
    } else {
      if (value >= currentMin) {
        setMaxPrice(value.toString())
        setPage(1)
      }
    }
  }

  useEffect(() => {
    if (!hasSize && mobileTab === 'size') {
      setMobileTab('price')
    }
  }, [hasSize, mobileTab])

  const minPercent = ((currentMin - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100
  const maxPercent = ((currentMax - MIN_PRICE_LIMIT) / (MAX_PRICE_LIMIT - MIN_PRICE_LIMIT)) * 100

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      className="relative z-[50] overflow-hidden"
    >
      <div className="rounded-3xl border border-foreground/10 bg-background/60 backdrop-blur-xl shadow-lg p-5 dark:bg-background/40">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-brand-purple hover:text-brand-purple/80 transition-colors px-3 py-1.5 rounded-full bg-brand-purple/10 hover:bg-brand-purple/20"
          >
            Clear All
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] mb-6">
          {(hasSize ? (['price', 'size', 'rating'] as const) : (['price', 'rating'] as const)).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-none inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all
                ${
                  mobileTab === tab
                    ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                    : "bg-background/80 border-foreground/10 text-foreground/70 hover:bg-foreground/5"
                }`}
            >
              {tab === 'price' && <IndianRupee className="w-4 h-4" />}
              {tab === 'size' && <Maximize2 className="w-4 h-4" />}
              {tab === 'rating' && <Star className="w-4 h-4" />}
              <span className="capitalize">{tab === 'price' ? 'Price' : tab === 'size' ? 'Size' : 'Rating'}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`space-y-6 ${mobileTab !== 'price' ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Price Range</h4>
              <div className="text-xs font-bold text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-md">
                ₹{currentMin} - ₹{currentMax}
              </div>
            </div>

            <div className="relative h-2 w-full mt-2 mb-6">
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-foreground/10 rounded-full"></div>
              <div 
                className="absolute top-0 bottom-0 bg-brand-purple/30 rounded-full"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
              ></div>

              <input
                type="range"
                min={MIN_PRICE_LIMIT}
                max={MAX_PRICE_LIMIT}
                value={currentMin}
                onChange={(e) => handlePriceRangeChange(e, 'min')}
                className={`absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-purple [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-purple [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer ${currentMin > (MAX_PRICE_LIMIT - 100) ? "z-50" : "z-30"}`}
              />

              <input
                type="range"
                min={MIN_PRICE_LIMIT}
                max={MAX_PRICE_LIMIT}
                value={currentMax}
                onChange={(e) => handlePriceRangeChange(e, 'max')}
                className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-purple [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-purple [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer z-40"
              />
            </div>
          </div>

          {hasSize && (
            <div className={`space-y-3 ${mobileTab !== 'size' ? 'hidden md:block' : ''}`}>
              <h4 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Size</h4>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((opt) => {
                  const val = String(opt.label)
                  const active = selectedSize === val
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedSize(active ? "" : val)
                        setPage(1)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                        ${
                          active
                            ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                            : "bg-background/50 border-foreground/10 hover:border-brand-purple/50 text-foreground"
                        }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className={`space-y-3 ${mobileTab !== 'rating' ? 'hidden md:block' : ''}`}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider">Minimum Rating</h4>
              {minRating && (
                <span className="text-xs font-medium text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                  {minRating} Stars & Up
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-background/50 border border-foreground/5">
              {[1, 2, 3, 4, 5].map((rating) => {
                const isActive = (minRating || 0) >= rating
                return (
                  <button
                    key={rating}
                    onClick={() => {
                      setMinRating(minRating === rating ? null : rating)
                      setPage(1)
                    }}
                    className="group relative focus:outline-none flex-1 flex justify-center"
                  >
                    <Star 
                      className={`w-8 h-8 md:w-6 md:h-6 transition-all duration-300 
                        ${isActive 
                          ? "fill-brand-purple text-brand-purple drop-shadow-sm scale-110" 
                          : "text-foreground/20 hover:text-brand-purple/40 hover:scale-110"
                        }`} 
                    />
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-foreground/40 text-center font-medium">
              Tap a star to filter by rating
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

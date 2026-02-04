'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

type DropdownItem = { id: string | number; label: string }

interface FilterControlsProps {
  isFilterOpen: boolean
  setIsFilterOpen: (v: boolean | ((prev: boolean) => boolean)) => void
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

export function FilterControls({
  isFilterOpen,
  setIsFilterOpen,
  isSortDropdownOpen,
  setIsSortDropdownOpen,
  sortBy,
  setSortBy,
  minPrice,
  maxPrice,
  minRating,
  selectedSize,
  setPage
}: FilterControlsProps) {
  return (
    <div className="flex items-center gap-2 relative z-30">
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          isFilterOpen || minPrice || maxPrice || minRating || selectedSize
            ? 'bg-brand-purple text-white border-brand-purple'
            : 'border-foreground/20 hover:bg-foreground/5'
        }`}
        onClick={() => setIsFilterOpen((prev) => !prev)}
      >
        <span className="hidden sm:inline">Filters</span>
        <span className="sm:hidden">Filters</span>
        {(minPrice || maxPrice || minRating || selectedSize) && (
          <span className="bg-white text-brand-purple text-[10px] font-bold px-1.5 rounded-full">!</span>
        )}
      </button>
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/20 text-sm font-medium hover:bg-foreground/5 transition-colors"
          onClick={() => setIsSortDropdownOpen((prev) => !prev)}
        >
          Sort: {sortBy === 'relevance' ? 'Relevance' : sortBy === 'price-asc' ? 'Price: Low to High' : sortBy === 'price-desc' ? 'Price: High to Low' : 'Rating'}
          <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        {isSortDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/20 rounded-lg shadow-lg z-10">
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
              onClick={() => { setSortBy('relevance'); setIsSortDropdownOpen(false); setPage(1) }}
            >
              Relevance
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
              onClick={() => { setSortBy('price-asc'); setIsSortDropdownOpen(false); setPage(1) }}
            >
              Price: Low to High
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
              onClick={() => { setSortBy('price-desc'); setIsSortDropdownOpen(false); setPage(1) }}
            >
              Price: High to Low
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm hover:bg-foreground/10"
              onClick={() => { setSortBy('rating'); setIsSortDropdownOpen(false); setPage(1) }}
            >
              Rating
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface FilterPanelProps {
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

export function FilterPanel({
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
  allSizes
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 p-4 border border-foreground/10 rounded-xl bg-foreground/5 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Price Range</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background"
            />
            <span className="text-foreground/40">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 rounded-lg border border-foreground/20 text-sm bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Size</label>
          <div className="flex flex-wrap gap-2">
            {(category ? getSizeOptionsForCategory(category) : allSizes).map((opt) => (
              <button
                key={String(opt.id)}
                onClick={() => { const val = String(opt.label); setSelectedSize(selectedSize === val ? '' : val); setPage(1) }}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  selectedSize === String(opt.label)
                    ? 'bg-brand-purple text-white border-brand-purple'
                    : 'bg-background border-foreground/20 hover:border-brand-purple/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Rating</label>
          <div className="space-y-1">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === rating}
                  onChange={() => { setMinRating(minRating === rating ? null : rating); setPage(1) }}
                  onClick={(e) => {
                    if (minRating === rating) {
                      e.preventDefault()
                      setMinRating(null)
                    }
                  }}
                  className="w-4 h-4 text-brand-purple focus:ring-brand-purple"
                />
                <div className="flex items-center text-sm text-foreground/70 group-hover:text-foreground">
                  <span className="flex text-yellow-500 mr-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <span key={i} className="text-gray-300">★</span>
                    ))}
                  </span>
                  & Up
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <button
            onClick={onClearFilters}
            className="w-full py-2 bg-background border border-foreground/20 text-foreground/70 rounded-lg text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { ChevronDown, SlidersHorizontal } from "lucide-react"

export type DropdownItem = {
  id: string | number
  label: string
}

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
  setPage,
}: FilterControlsProps) {
  const hasFilters = Boolean(
    minPrice || maxPrice || minRating || selectedSize
  )

  return (
    <div className="relative z-[60] flex flex-wrap items-center gap-3 sm:gap-4">
      <button
        onClick={() => setIsFilterOpen((p) => !p)}
        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all
          ${
            isFilterOpen || hasFilters
              ? "bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-lg shadow-purple-500/30"
              : "bg-background border border-foreground/20 hover:bg-foreground/5 dark:bg-background/80"
          }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {hasFilters && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      <div className="relative z-[70]">
        <button
          onClick={() => setIsSortDropdownOpen((p) => !p)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-background border border-foreground/20 text-sm font-medium hover:bg-foreground/5 transition-all dark:bg-background/80"
        >
          Sort by:
          <span className="font-semibold">
            {sortBy === "relevance"
              ? " Relevance"
              : sortBy === "price-asc"
              ? " Price ↑"
              : sortBy === "price-desc"
              ? " Price ↓"
              : " Rating"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isSortDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isSortDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-3 w-60 rounded-2xl bg-background/95 backdrop-blur-xl border border-foreground/10 shadow-2xl overflow-hidden z-[80] dark:bg-background/90"
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
                className={`w-full px-4 py-3 text-sm text-left transition-all
                  ${
                    sortBy === value
                      ? "bg-brand-purple/10 text-brand-purple font-semibold dark:bg-brand-purple/20"
                      : "hover:bg-foreground/5 dark:hover:bg-foreground/10"
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
  allSizes,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      className="relative z-[50] rounded-3xl border border-foreground/10 bg-gradient-to-br from-background via-background to-foreground/5 shadow-2xl p-6 dark:from-background dark:to-foreground/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FilterCard title="Price Range">
          <div className="flex gap-3">
            <InputBox
              placeholder="Min"
              value={minPrice}
              onChange={(v) => {
                setMinPrice(v)
                setPage(1)
              }}
            />
            <InputBox
              placeholder="Max"
              value={maxPrice}
              onChange={(v) => {
                setMaxPrice(v)
                setPage(1)
              }}
            />
          </div>
        </FilterCard>

        <FilterCard title="Size">
          <div className="flex flex-wrap gap-2">
            {(category ? getSizeOptionsForCategory(category) : allSizes).map(
              (opt) => {
                const val = String(opt.label)
                const active = selectedSize === val
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedSize(active ? "" : val)
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                      ${
                        active
                          ? "bg-brand-purple text-white shadow-lg shadow-purple-500/30 scale-105"
                          : "bg-background border border-foreground/20 hover:border-brand-purple hover:scale-105 dark:bg-background/70"
                      }`}
                  >
                    {opt.label}
                  </button>
                )
              }
            )}
          </div>
        </FilterCard>

        <FilterCard title="Minimum Rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => {
              const active = minRating === rating
              return (
                <button
                  key={rating}
                  onClick={() => {
                    setMinRating(active ? null : rating)
                    setPage(1)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
                    ${
                      active
                        ? "bg-yellow-400/20 text-yellow-700 shadow-inner dark:text-yellow-400"
                        : "hover:bg-foreground/5 dark:hover:bg-foreground/10"
                    }`}
                >
                  <span className="text-yellow-500 text-lg">
                    {"★".repeat(rating)}
                    <span className="text-gray-400">
                      {"★".repeat(5 - rating)}
                    </span>
                  </span>
                  <span className="text-sm font-medium">& Up</span>
                </button>
              )
            })}
          </div>
        </FilterCard>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-7 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-200 to-gray-300 hover:from-brand-purple hover:to-purple-600 hover:text-white transition-all shadow-md dark:from-foreground/20 dark:to-foreground/30"
        >
          Clear All Filters
        </button>
      </div>
    </motion.div>
  )
}


function FilterCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background/80 backdrop-blur p-5 shadow-md dark:bg-background/70">
      <h4 className="mb-4 text-sm font-bold text-foreground/80">{title}</h4>
      {children}
    </div>
  )
}

function InputBox({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-foreground/20 bg-background focus:ring-2 focus:ring-brand-purple focus:outline-none transition-all dark:bg-background/70"
    />
  )
}

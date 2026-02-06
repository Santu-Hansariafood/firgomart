'use client'

import { motion } from 'framer-motion'
import { DropdownItem } from '@/components/ui/ProductGrid/ProductFilters'

interface SidebarFiltersProps {
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

export default function SidebarFilters({
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
}: SidebarFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-xs font-medium text-brand-purple hover:underline"
        >
          Clear All
        </button>
      </div>

      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <InputBox
            placeholder="Min"
            value={minPrice}
            onChange={(v) => {
              setMinPrice(v)
              setPage(1)
            }}
          />
          <span className="text-foreground/40">-</span>
          <InputBox
            placeholder="Max"
            value={maxPrice}
            onChange={(v) => {
              setMaxPrice(v)
              setPage(1)
            }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Size">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${
                      active
                        ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                        : "bg-foreground/5 text-foreground/70 hover:bg-foreground/10"
                    }`}
                >
                  {opt.label}
                </button>
              )
            }
          )}
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => {
            const active = minRating === rating
            return (
              <button
                key={rating}
                onClick={() => {
                  setMinRating(active ? null : rating)
                  setPage(1)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm
                  ${
                    active
                      ? "bg-brand-purple/10 text-brand-purple font-medium"
                      : "text-foreground/70 hover:bg-foreground/5"
                  }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-brand-purple">★</span>
                  <span>{rating} & Up</span>
                </span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />}
              </button>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-foreground/5 pb-6 last:border-0 last:pb-0">
      <h4 className="mb-3 text-sm font-bold text-foreground/80 uppercase tracking-wider">{title}</h4>
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
      className="w-full px-3 py-2 rounded-lg border border-foreground/10 bg-background focus:ring-1 focus:ring-brand-purple focus:border-brand-purple focus:outline-none transition-all text-sm"
    />
  )
}

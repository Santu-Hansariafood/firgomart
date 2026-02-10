'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Sparkles, Gift, Zap, Star, ShoppingBag } from 'lucide-react'

interface PriceCategoryBannerProps {
  onSelectCategory: (min: number, max: number, type?: string) => void
}

export default function PriceCategoryBanner({ onSelectCategory }: PriceCategoryBannerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const categories = [
    {
      id: 'under-199',
      title: 'Under ₹199',
      subtitle: 'Budget Buys',
      icon: Tag,
      color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      iconBg: 'bg-white dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      min: 100,
      max: 199
    },
    {
      id: 'under-299',
      title: 'Under ₹299',
      subtitle: 'Value Picks',
      icon: Zap,
      color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      iconBg: 'bg-white dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      min: 200,
      max: 299
    },
    {
      id: 'under-399',
      title: 'Under ₹399',
      subtitle: 'Best Sellers',
      icon: Star,
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-white dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      min: 300,
      max: 399
    },
    {
      id: 'under-499',
      title: 'Under ₹499',
      subtitle: 'Trending Now',
      icon: ShoppingBag,
      color: 'bg-zinc-50 dark:bg-zinc-950/30 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800',
      iconBg: 'bg-white dark:bg-zinc-900/20',
      iconColor: 'text-zinc-700 dark:text-zinc-300',
      min: 400,
      max: 499
    },
    {
    id: 'under-599',
    title: 'Under ₹599',
    subtitle: 'customer Choice',
    icon: Zap,
    color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    iconBg: 'bg-white dark:bg-teal-900/20',
    iconColor: 'text-teal-600 dark:text-teal-400',
    min: 500,
    max: 599
  },
  {
    id: 'under-699',
    title: 'Under ₹699',
    subtitle: 'Premium Picks',
    icon: Star,
    color: 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    iconBg: 'bg-white dark:bg-slate-800/40',
    iconColor: 'text-slate-700 dark:text-slate-300',
    min: 600,
    max: 699
  },
    {
      id: 'special-price',
      title: 'Special Price',
      subtitle: 'Limited Time',
      icon: Sparkles,
      color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      iconBg: 'bg-white dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      type: 'special',
      min: 500,
      max: 10000
    },
    {
      id: 'discounted',
      title: 'Discount Zone',
      subtitle: 'Min 50% Off',
      icon: Gift,
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      iconBg: 'bg-white dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      type: 'discount',
      min: 0,
      max: 10000
    }
  ]

  return (
    <div className="relative group">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-10 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-background to-transparent" />
      
      <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveId(cat.id)
              onSelectCategory(cat.min, cat.max, cat.type)
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm transition-all hover:shadow-md ${cat.color} min-w-[140px] sm:min-w-fit flex-shrink-0 ${
              activeId === cat.id ? 'ring-2 ring-offset-2 ring-brand-purple scale-[1.02]' : ''
            }`}
          >
            <div className={`p-2 rounded-full shadow-sm ${cat.iconBg} ${cat.iconColor}`}>
              <cat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm sm:text-base leading-tight">{cat.title}</div>
              <div className="text-[10px] sm:text-xs opacity-80 font-medium">{cat.subtitle}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

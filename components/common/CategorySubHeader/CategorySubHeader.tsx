"use client"

import { motion } from 'framer-motion'
import FallbackImage from '@/components/common/Image/FallbackImage'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag,
  Users,
  Footprints,
  Sparkles,
  Heart,
  Home,
  LucideIcon,
} from 'lucide-react'

interface Category {
  id: number
  name: string
  icon: LucideIcon
  color: string
  image: string
}

const categories: Category[] = [
  {
    id: 1,
    name: "Women's Fashion",
    icon: ShoppingBag,
    color: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
    image:
      '/image/women.webp',
  },
  {
    id: 2,
    name: "Men's Casual Wear",
    icon: Users,
    color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    image:
      '/image/man.webp',
  },
  {
    id: 3,
    name: 'Footwear',
    icon: Footprints,
    color: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    image:
      '/image/foot.webp',
  },
  {
    id: 4,
    name: 'Jewellery & Accessories',
    icon: Sparkles,
    color: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
    image:
      '/image/juallery.webp',
  },
  {
    id: 5,
    name: 'Beauty & Skincare',
    icon: Heart,
    color: 'bg-rose-100 hover:bg-rose-200 text-rose-700',
    image:
      '/image/beauti.webp',
  },
  {
    id: 6,
    name: 'Home & Kitchen',
    icon: Home,
    color: 'bg-green-100 hover:bg-green-200 text-green-700',
    image:
      '/image/home.webp',
  },
]

const CategorySubHeader: React.FC = () => {
  const pathname = usePathname()
  const isAdminHost = typeof window !== 'undefined' ? !!(window.location.hostname && window.location.hostname.toLowerCase().includes('admin')) : false
  const hide = (
    isAdminHost ||
    pathname.startsWith('/admin') ||
    pathname === '/admin-login' ||
    pathname.startsWith('/seller') ||
    pathname === '/seller-login'
  )
  if (hide) return null

  return (
    <div className="bg-white border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] relative z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-start md:items-center justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2 md:mx-0 snap-x snap-mandatory md:snap-none">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
              className="shrink-0 snap-center"
            >
              <button
                className="group flex flex-col items-center gap-3 p-2 rounded-2xl transition-all duration-300 hover:bg-gray-50/80 w-24 md:w-28"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 ring-1 ring-gray-100 group-hover:ring-2 group-hover:ring-brand-purple/20 bg-gray-50">
                  <FallbackImage
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <span className="text-[11px] md:text-xs font-semibold text-gray-600 group-hover:text-brand-purple text-center leading-snug whitespace-normal break-words max-w-[100%] transition-colors duration-300">
                  {category.name}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategorySubHeader

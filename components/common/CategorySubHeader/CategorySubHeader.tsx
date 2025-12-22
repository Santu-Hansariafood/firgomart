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
      '/image/my.jpeg',
  },
  {
    id: 2,
    name: "Men's Casual Wear",
    icon: Users,
    color: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    image:
      '/image/my.jpeg',
  },
  {
    id: 3,
    name: 'Footwear',
    icon: Footprints,
    color: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    image:
      '/image/my.jpeg',
  },
  {
    id: 4,
    name: 'Jewellery & Accessories',
    icon: Sparkles,
    color: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
    image:
      '/image/my.jpeg',
  },
  {
    id: 5,
    name: 'Beauty & Skincare',
    icon: Heart,
    color: 'bg-rose-100 hover:bg-rose-200 text-rose-700',
    image:
      '/image/my.jpeg',
  },
  {
    id: 6,
    name: 'Home & Kitchen',
    icon: Home,
    color: 'bg-green-100 hover:bg-green-200 text-green-700',
    image:
      '/image/my.jpeg',
  },
]

const CategorySubHeader: React.FC = () => {
  const pathname = usePathname()
  const hide = (
    pathname.startsWith('/admin') ||
    pathname === '/admin-login' ||
    pathname.startsWith('/seller') ||
    pathname === '/seller-login'
  )
  if (hide) return null
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-stretch gap-3 md:gap-4 lg:gap-6 overflow-x-auto md:overflow-x-visible md:flex-wrap md:justify-center scrollbar-hide snap-x snap-mandatory md:snap-none scroll-smooth -mx-2 px-2 py-1">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="shrink-0 snap-start"
            >
              <button
                className="flex flex-col items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all w-24 md:w-28 lg:w-32"
              >
                <div className="relative rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 mx-auto w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24">
                  <FallbackImage
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 96px"
                    className="object-cover"
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-800 text-center w-24 md:w-28 truncate">
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

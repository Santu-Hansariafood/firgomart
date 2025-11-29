'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center space-x-3 overflow-x-auto scrollbar-hide">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full font-medium text-xs whitespace-nowrap transition-all shadow-sm ${category.color}`}
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategorySubHeader

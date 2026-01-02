"use client"

import { motion } from "framer-motion"
import FallbackImage from "@/components/common/Image/FallbackImage"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

interface Category {
  id: number
  name: string
  image: string
}

interface Props {
  activeCategory: string | null
  onCategorySelect: (category: string | null) => void
}

const categories: Category[] = [
  { id: 1, name: "Women's Fashion", image: "/image/women.webp" },
  { id: 2, name: "Men's Casual Wear", image: "/image/man.webp" },
  { id: 3, name: "Footwear", image: "/image/foot.webp" },
  { id: 4, name: "Jewellery & Accessories", image: "/image/juallery.webp" },
  { id: 5, name: "Beauty & Skincare", image: "/image/beauti.webp" },
  { id: 6, name: "Home & Kitchen", image: "/image/home.webp" },
]

const CategorySubHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategories = searchParams.get('category')?.split(',').filter(Boolean) || []

  const isAdminHost =
    typeof window !== 'undefined' &&
    window.location.hostname.toLowerCase().includes('admin')

  const hide =
    isAdminHost ||
    pathname.startsWith('/admin') ||
    pathname === '/admin-login' ||
    pathname.startsWith('/seller') ||
    pathname === '/seller-login'

  const toggleCategory = (catName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    let newCats = [...currentCategories]
    
    if (newCats.includes(catName)) {
      newCats = newCats.filter(c => c !== catName)
    } else {
      newCats.push(catName)
    }

    if (newCats.length > 0) {
      params.set('category', newCats.join(','))
    } else {
      params.delete('category')
    }

    router.push(`/?${params.toString()}`, { scroll: false })
  }

  if (hide) return null

  return (
    <div className="relative z-30 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        <div
          className="
            flex gap-4 sm:gap-6 items-center
            justify-start sm:justify-center
            overflow-x-auto snap-x snap-mandatory
            scrollbar-hide
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {categories.map((category, index) => {
            const isActive = currentCategories.includes(category.name)
            const isFootwear = category.name === 'Footwear'

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="shrink-0 snap-center"
              >
                <button
                  onClick={() => toggleCategory(category.name)}
                  className={`
                    group flex flex-col items-center gap-2 px-2 py-1 rounded-xl
                    transition-all duration-300 focus:outline-none relative
                    ${
                      isActive
                        ? 'bg-brand-purple/10 scale-105'
                        : 'hover:bg-gray-50'
                    }
                  `}
                >
                  {/* Remove Badge */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 bg-brand-purple text-white rounded-full p-0.5 shadow-sm z-10">
                      <X size={10} strokeWidth={3} />
                    </div>
                  )}

                  {/* Image */}
                  <div
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden
                      ring-2 transition-all duration-300
                      ${
                        isActive
                          ? 'ring-brand-purple'
                          : 'ring-gray-200 group-hover:ring-brand-purple/30'
                      }
                    `}
                  >
                    <FallbackImage
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 48px, 56px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[5.5rem] min-h-[2.4em]">
                    {isFootwear && <span className="block invisible">.</span>}
                    <span
                      className={`block ${
                        isActive
                          ? 'text-brand-purple font-semibold'
                          : 'text-gray-600'
                      }`}
                    >
                      {category.name}
                    </span>
                  </span>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CategorySubHeader

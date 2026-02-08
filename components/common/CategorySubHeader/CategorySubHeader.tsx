"use client"

import { motion } from "framer-motion"
import FallbackImage from "@/components/common/Image/FallbackImage"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import categoriesData from "@/data/categories.json"

type JsonCategory = { name: string; image: string; key: string }
const categories: Array<{ id: number; name: string; image: string; key: string }> =
  (categoriesData as { categories: JsonCategory[] }).categories.map((c, i) => ({
    id: i + 1,
    name: c.name,
    image: c.image,
    key: c.key,
  }))

const CategorySubHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  // Support both legacy query param and new route
  const currentSelectedName = (searchParams.get('category') || '').trim()
  
  const isAdminHost =
    typeof window !== 'undefined' &&
    window.location.hostname.toLowerCase().includes('admin')

  const isHome = pathname === '/'
  const isCategoryPage = pathname.startsWith('/category/')
  
  const hide =
    isAdminHost ||
    (!isHome && !isCategoryPage)

  const toggleCategory = (catKey: string) => {
    if (pathname === `/category/${catKey}`) {
      router.push('/')
    } else {
      router.push(`/category/${catKey}`)
    }
  }

  if (hide) return null

  return (
    <div className="relative z-30 bg-[var(--background)] border-b border-[var(--foreground)/10] mt-2 sm:mt-3">
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
            // Active if we are on the category page OR if the query param matches (legacy support)
            const isActive = pathname === `/category/${category.key}` || currentSelectedName === category.name

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className="shrink-0 snap-center"
              >
                <button
                  onClick={() => toggleCategory(category.key)}
                  className={`
                    group flex flex-col items-center gap-2 px-2 py-1 rounded-xl
                    transition-all duration-300 focus:outline-none relative
                    ${
                      isActive
                        ? 'bg-brand-purple/10 scale-105'
                        : 'hover:bg-[var(--background)/80]'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute -top-1 -right-1 bg-brand-purple text-white rounded-full p-0.5 shadow-sm z-10">
                    </div>
                  )}

                  <div
                    className={`
                      relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden
                      ring-2 transition-all duration-300
                      ${
                        isActive
                          ? 'ring-brand-purple'
                          : 'ring-[var(--foreground)/20] group-hover:ring-brand-purple/30'
                      }
                    `}
                  >
                    <FallbackImage
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
                    className="object-cover object-center rounded-full transition-transform duration-500"
                  />

                  </div>

                  <span className="text-[10px] sm:text-xs font-medium text-center leading-tight max-w-[5.5rem] min-h-[2.4em]">
                    <span
                      className={`block ${
                        isActive
                          ? 'text-brand-purple font-semibold'
                          : 'text-[var(--foreground)/70]'
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

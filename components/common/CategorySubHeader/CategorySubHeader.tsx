"use client"

import { motion } from "framer-motion"
import FallbackImage from "@/components/common/Image/FallbackImage"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import categoriesData from "@/data/categories.json"

type JsonCategory = { name: string; image: string }
const categories: Array<{ id: number; name: string; image: string }> =
  (categoriesData as { categories: JsonCategory[] }).categories.map((c, i) => ({
    id: i + 1,
    name: c.name,
    image: c.image,
  }))

interface Props {
  activeCategory: string | null
  onCategorySelect: (category: string | null) => void
}

const CategorySubHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSelected = (searchParams.get('category') || '').trim()

  const isAdminHost =
    typeof window !== 'undefined' &&
    window.location.hostname.toLowerCase().includes('admin')

  const isHome = pathname === '/'
  const hide =
    isAdminHost ||
    !isHome

  const toggleCategory = (catName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSelected === catName) {
      params.delete('category')
    } else {
      params.set('category', catName)
    }
    router.push(`/?${params.toString()}`, { scroll: false })
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
            const isActive = currentSelected === category.name
            const isFootwear = category.name.startsWith('Footwear')

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
                    {isFootwear && <span className="block invisible">.</span>}
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

"use client"

import { motion } from "framer-motion"
import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import FallbackImage from "@/components/common/Image/FallbackImage"
import categoriesData from "@/data/categories.json"

type JsonCategory = { name: string; image: string; key: string }

const categories = (categoriesData as { categories: JsonCategory[] }).categories.map(
  (c, i) => ({
    id: i + 1,
    name: c.name,
    image: c.image,
    key: c.key,
  })
)

export default function CategorySubHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSelectedName = (searchParams.get("category") || "").trim()

  const isAdminHost =
    typeof window !== "undefined" &&
    window.location.hostname.toLowerCase().includes("admin")

  const isHome = pathname === "/"
  const isCategoryPage = pathname.startsWith("/category/")
  const hide = isAdminHost || (!isHome && !isCategoryPage)

  useEffect(() => {
    if (pathname.startsWith("/category/")) router.replace("/")
  }, [])

  const toggleCategory = (key: string) => {
    router.push(pathname === `/category/${key}` ? "/" : `/category/${key}`)
  }

  if (hide) return null

  return (
    <div className="sticky top-0 z-30">
      <div className="backdrop-blur-xl bg-[var(--background)/80] border-b border-[var(--foreground)/10]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div
            className="
              flex gap-5 items-center overflow-x-auto snap-x snap-mandatory
              scrollbar-hide flex-nowrap
            "
          >
            {categories.map((category, index) => {
              const isActive =
                pathname === `/category/${category.key}` ||
                currentSelectedName === category.name

              return (
                <motion.button
                  key={category.id}
                  onClick={() => toggleCategory(category.key)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="
                    relative shrink-0 snap-center
                    flex flex-col items-center gap-2
                    focus:outline-none
                  "
                >
                  {/* Image */}
                  <div
                    className={`
                      relative w-14 h-14 rounded-full overflow-hidden
                      ring-2 transition-all duration-300
                      ${
                        isActive
                          ? "ring-brand-purple shadow-[0_0_0_6px_rgba(124,58,237,0.15)]"
                          : "ring-[var(--foreground)/15] hover:ring-brand-purple/40"
                      }
                    `}
                  >
                    <FallbackImage
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      text-xs font-medium text-center leading-tight
                      transition-colors
                      ${
                        isActive
                          ? "text-brand-purple"
                          : "text-[var(--foreground)/70]"
                      }
                    `}
                  >
                    {category.name}
                  </span>

                  {/* Active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="active-category"
                      className="absolute -bottom-1 h-[3px] w-6 rounded-full bg-brand-purple"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface Advertisement {
  _id: string
  title: string
  description: string
  buttonText: string
  image: string
  section?: string
  linkType?: string
  linkId?: string
}

interface AdCarouselProps {
  section?: string
}

const AdCarousel: React.FC<AdCarouselProps> = ({ section = "hero" }) => {
  const router = useRouter()
  const [current, setCurrent] = useState<number>(0)
  const [banners, setBanners] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners')
        if (res.ok) {
          const data = await res.json()
          if (data.banners && data.banners.length > 0) {
            // Filter by section
            const filtered = data.banners.filter((b: Advertisement) => (b.section || "hero") === section)
            setBanners(filtered)
          }
        }
      } catch (err) {
        console.error("Failed to fetch banners", err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [section])

  useEffect(() => {
    if (banners.length === 0) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [banners.length])

  const next = () => setCurrent((prev) => (prev + 1) % banners.length)
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)

  const handleAdClick = (ad: Advertisement) => {
    if (!ad.linkType || !ad.linkId) return

    switch (ad.linkType) {
      case 'external':
        window.open(ad.linkId, '_blank')
        break
      case 'product':
        router.push(`/product/${ad.linkId}`)
        break
      case 'category':
        router.push(`/category/${ad.linkId}`)
        break
    }
  }

  if (loading) {
    return (
      <section className="bg-[var(--background)] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-64 md:h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </section>
    )
  }

  if (banners.length === 0) return null

  const currentAd = banners[current]

  return (
    <section className="bg-[var(--background)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd._id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={currentAd.image}
                alt={currentAd.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                  {currentAd.title}
                </h2>
                <p className="text-lg md:text-xl mb-4 opacity-90">
                  {currentAd.description}
                </p>
                <button 
                  onClick={() => handleAdClick(currentAd)}
                  className="px-6 py-3 bg-brand-purple hover:bg-brand-red rounded-lg font-medium transition-colors"
                >
                  {currentAd.buttonText}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous Slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)/90] hover:bg-[var(--background)] rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6 text-[color:var(--foreground)]" />
              </button>
              <button
                onClick={next}
                aria-label="Next Slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[var(--background)/90] hover:bg-[var(--background)] rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6 text-[color:var(--foreground)]" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === current ? 'bg-[var(--foreground)] w-8' : 'bg-[var(--foreground)/50]'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdCarousel

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { advertisements } from '@/data/mockData'

interface Advertisement {
  id: number
  title: string
  description: string
  buttonText: string
  image: string
}

const AdCarousel: React.FC = () => {
  const [current, setCurrent] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % advertisements.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % advertisements.length)
  const prev = () => setCurrent((prev) => (prev - 1 + advertisements.length) % advertisements.length)

  const currentAd: Advertisement = advertisements[current]

  return (
    <section className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAd.id}
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
                <button className="px-6 py-3 bg-brand-purple hover:bg-brand-red rounded-lg font-medium transition-colors">
                  {currentAd.buttonText}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <button
            onClick={prev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <button
            onClick={next}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {advertisements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdCarousel

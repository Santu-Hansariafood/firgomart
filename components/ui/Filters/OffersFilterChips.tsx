'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Check } from 'lucide-react'

export type Offer = { 
  id: string
  key: string
  name: string
  type: string
  value?: number | string 
}

type Props = {
  selectedOffer?: string
  onChange: (next: string | null, offer?: Offer) => void
}

export default function OffersFilterChips({ selectedOffer, onChange }: Props) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/offers', { cache: 'no-store' })
        const data = await res.json()
        const list = Array.isArray(data.offers) ? data.offers : []
        if (mounted) setOffers(list)
      } catch {
        if (mounted) setOffers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  if (offers.length === 0 && !loading) return null

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
        <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-gray-200">
          <Tag className="w-4 h-4 text-brand-purple" />
          <span className="text-sm font-bold text-gray-800 whitespace-nowrap">Special Offers</span>
        </div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(null)}
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm whitespace-nowrap ${
              !selectedOffer
                ? 'bg-brand-purple text-white shadow-brand-purple/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-purple/50 hover:text-brand-purple'
            }`}
          >
            All Offers
          </motion.button>
          
          <AnimatePresence>
            {offers.map((o) => {
              const active = selectedOffer === o.key
              return (
                <motion.button
                  key={o.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onChange(active ? null : o.key, o)}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm whitespace-nowrap ${
                    active
                      ? 'bg-brand-purple text-white shadow-brand-purple/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-purple/50 hover:text-brand-purple'
                  }`}
                  title={o.name}
                >
                  {active && <Check className="w-3 h-3" />}
                  {o.name}
                </motion.button>
              )
            })}
          </AnimatePresence>
          
          {loading && (
            <div className="flex items-center px-2">
              <div className="w-4 h-4 border-2 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

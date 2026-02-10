'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Navigation } from 'lucide-react'

interface LocationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestLocation: () => Promise<void>
  loading: boolean
}

export default function LocationRequestModal({ isOpen, onClose, onRequestLocation, loading }: LocationRequestModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 relative border border-gray-200 dark:border-gray-800"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-brand-purple">
              <MapPin className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-bold font-heading">Enable Location</h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              To show you products available for delivery in your area and accurate shipping times, please enable location services.
            </p>

            <div className="w-full space-y-3 pt-2">
              <button
                onClick={onRequestLocation}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-purple text-white py-3 rounded-xl font-medium hover:bg-brand-purple/90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    Allow Location Access
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-foreground transition-colors"
              >
                Enter Manually Later
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

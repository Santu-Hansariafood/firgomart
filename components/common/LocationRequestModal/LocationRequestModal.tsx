'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, X, Navigation, Search, Map } from 'lucide-react'
import { useState, useMemo } from 'react'
import locationData from '@/data/country.json'

interface LocationRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onRequestLocation: () => Promise<void>
  onManualLocation?: (state: string, country: string) => void
  loading: boolean
  countryName?: string
}

export default function LocationRequestModal({ 
  isOpen, 
  onClose, 
  onRequestLocation, 
  onManualLocation, 
  loading,
  countryName
}: LocationRequestModalProps) {
  const [mode, setMode] = useState<'prompt' | 'manual'>('prompt')
  const [searchTerm, setSearchTerm] = useState('')

  const { selectedCountryName, states } = useMemo(() => {
    const allCountries = (locationData as any).countries as { country: string; states?: { state: string }[] }[]
    const normalized = (countryName || '').toLowerCase()
    let chosen = allCountries.find((c) => c.country.toLowerCase() === normalized)
    if (!chosen) {
      chosen = allCountries.find((c) => c.country === 'India') || allCountries[0]
    }
    const stateNames = chosen?.states ? chosen.states.map((s) => s.state).sort() : []
    return { selectedCountryName: chosen?.country || (countryName || ''), states: stateNames }
  }, [countryName])

  const filteredStates = useMemo(() => {
    if (!searchTerm) return states
    return states.filter(state => 
      state.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [states, searchTerm])

  const handleManualSelect = (state: string) => {
    if (onManualLocation) {
      onManualLocation(state, selectedCountryName)
      setMode('prompt')
    }
  }

  const handleClose = () => {
    setMode('prompt')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background rounded-2xl shadow-xl w-full max-w-sm p-6 relative border border-gray-200 dark:border-gray-800 max-h-[80vh] flex flex-col"
        >
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {mode === 'prompt' ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-brand-purple">
                <MapPin className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold font-heading">Set Current Location</h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pinpoint your current location for accurate delivery availability and shipping times.
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
                      Use Current Location
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setMode('manual')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-foreground/5 text-foreground font-medium rounded-xl hover:bg-foreground/10 transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Select State Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
               <h3 className="text-xl font-bold font-heading mb-4">Select State</h3>
               <div className="relative mb-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                   type="text"
                   placeholder="Search state..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 bg-foreground/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-purple/50 outline-none"
                   autoFocus
                 />
               </div>
               
               <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1 custom-scrollbar">
                 {filteredStates.length > 0 ? (
                   filteredStates.map(state => (
                     <button
                       key={state}
                       onClick={() => handleManualSelect(state)}
                       className="w-full text-left px-3 py-3 rounded-lg hover:bg-brand-purple/5 hover:text-brand-purple transition-colors text-sm font-medium border-b border-foreground/5 last:border-0"
                     >
                       {state}
                     </button>
                   ))
                 ) : (
                   <p className="text-center text-gray-500 py-4 text-sm">No states found</p>
                 )}
               </div>
               
               <button 
                 onClick={() => setMode('prompt')}
                 className="mt-4 text-sm text-gray-500 hover:text-foreground font-medium"
               >
                 Back
               </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

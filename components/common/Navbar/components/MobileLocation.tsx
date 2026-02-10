import { MapPin, ChevronDown } from "lucide-react"

interface MobileLocationProps {
  isAuthenticated: boolean
  locationLoading: boolean
  deliverToState: string
  setShowLocationModal: (show: boolean) => void
  setShowLoginModal: (show: boolean) => void
}

const MobileLocation = ({
  isAuthenticated,
  locationLoading,
  deliverToState,
  setShowLocationModal,
  setShowLoginModal
}: MobileLocationProps) => {
  return (
    <div className="md:hidden w-full bg-gradient-to-r from-brand-purple to-brand-red text-white">
      <button 
        className="w-full max-w-7xl mx-auto px-3 py-2 flex items-center gap-2 text-xs sm:text-sm font-medium"
        onClick={() => {
          if (!isAuthenticated) {
            setShowLoginModal(true)
            return
          }
          setShowLocationModal(true)
        }}
      >
        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" />
        <span className="opacity-90">Deliver to:</span>
        <span className="font-bold truncate max-w-[200px]">
          {locationLoading ? "Locating..." : (deliverToState || "Select Location")}
        </span>
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/80 ml-auto sm:ml-1" />
      </button>
    </div>
  )
}

export default MobileLocation

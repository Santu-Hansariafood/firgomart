import { MapPin, ChevronDown } from "lucide-react"

interface MobileLocationProps {
  isAuthenticated: boolean
  locationLoading: boolean
  deliverToState: string
  fullLocation: string
  setShowLocationModal: (show: boolean) => void
  setShowLoginModal: (show: boolean) => void
}

const MobileLocation = ({
  isAuthenticated,
  locationLoading,
  deliverToState,
  fullLocation,
  setShowLocationModal,
  setShowLoginModal
}: MobileLocationProps) => {
  return (
    <div className="md:hidden w-full bg-gradient-to-r from-brand-purple/90 to-brand-red/90 text-white backdrop-blur-md">
      <button 
        className="w-full max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium"
        onClick={() => {
          if (!isAuthenticated) {
            setShowLoginModal(true)
            return
          }
          setShowLocationModal(true)
        }}
      >
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
          <MapPin className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col items-start overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-80 leading-none mb-1">Current Location</span>
          <span className="font-bold truncate max-w-[250px] leading-none">
            {locationLoading ? "Fetching pinpoint..." : (fullLocation || deliverToState || "Select Location")}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-white/80 ml-auto" />
      </button>
    </div>
  )
}

export default MobileLocation

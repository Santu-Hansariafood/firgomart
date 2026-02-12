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
    <div className="md:hidden w-full bg-gray-200 text-gray-600 shadow-sm">
      <button 
        className="w-full max-w-7xl mx-auto px-2 py-0.5 flex items-center justify-center gap-1 text-xs font-semibold tracking-wide"
        onClick={() => {
          if (!isAuthenticated) {
            setShowLoginModal(true)
            return
          }
          setShowLocationModal(true)
        }}
      >
        <MapPin className="w-3 h-3 shrink-0" />
        <span className="truncate max-w-[85vw]">
          {locationLoading ? "Detecting Location..." : (fullLocation || deliverToState || "Select Delivery Location")}
        </span>
        <ChevronDown className="w-3 h-3 shrink-0 opacity-70" />
      </button>
    </div>
  )
}

export default MobileLocation

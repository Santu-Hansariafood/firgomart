import { MapPin } from "lucide-react"

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
    <button 
      className="md:hidden flex items-center gap-2 mr-auto ml-2 px-3 py-1.5 rounded-full bg-brand-purple/5 border border-brand-purple/10 active:scale-95 transition-all" 
      onClick={() => {
        if (!isAuthenticated) {
          setShowLoginModal(true)
          return
        }
        setShowLocationModal(true)
      }}
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-purple to-brand-red p-[1px] flex-shrink-0">
         <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-brand-purple" />
         </div>
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-brand-red truncate max-w-[110px] leading-none">
          {locationLoading ? "Locating..." : (deliverToState || "Select Location")}
        </span>
      </div>
    </button>
  )
}

export default MobileLocation

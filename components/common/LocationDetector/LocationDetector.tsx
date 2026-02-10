import React, { useState } from 'react';
import { Locate, Loader2 } from 'lucide-react';

export interface LocationData {
  address: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
}

interface LocationDetectorProps {
  onLocationDetected: (data: LocationData) => void;
  className?: string;
}

export const LocationDetector: React.FC<LocationDetectorProps> = ({
  onLocationDetected,
  className = "",
}) => {
  const [detecting, setDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const detectLocation = () => {
    setDetecting(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const newState = addr.state || "";
            const newDistrict = addr.state_district || addr.county || "";
            const newCity = addr.city || addr.town || addr.village || addr.municipality || "";
            const newPincode = addr.postcode || "";
            
            const street = addr.road || addr.street || addr.pedestrian || "";
            const area = addr.suburb || addr.neighbourhood || addr.residential || "";
            const cityPart = addr.city || addr.town || addr.village || "";
            
            const formattedAddress = [street, area, cityPart, newDistrict, newState, newPincode]
                .filter(Boolean)
                .join(", ");

            onLocationDetected({
              address: formattedAddress,
              state: newState,
              district: newDistrict,
              city: newCity,
              pincode: newPincode,
            });
          } else {
             setLocationError("Could not fetch address details");
          }
        } catch (error) {
          setLocationError("Failed to fetch location details");
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setDetecting(false);
      }
    );
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand-purple/5 to-brand-purple/10 text-brand-purple border border-brand-purple/20 hover:border-brand-purple/40 hover:from-brand-purple/10 hover:to-brand-purple/20 transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:shadow-brand-purple/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        <span className="relative z-10 flex items-center gap-2">
          {detecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Locate className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
          )}
          {detecting ? 'Detecting Location...' : 'Detect My Location'}
        </span>
        <div className="absolute inset-0 bg-brand-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
      
      {locationError && (
        <div className="mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {locationError}
        </div>
      )}
    </div>
  );
};

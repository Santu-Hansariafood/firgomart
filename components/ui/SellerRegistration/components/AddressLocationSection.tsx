import React, { ChangeEvent, Suspense, useState } from 'react';
import { MapPin, Flag, Map, Globe, Building2, Locate, Loader2 } from 'lucide-react';
import { SellerFormData } from '@/types/seller';
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader';

interface AddressLocationSectionProps {
  formData: SellerFormData;
  setFormData: React.Dispatch<React.SetStateAction<SellerFormData>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleStateChange: (state: string) => void;
  errors: Record<string, string>;
  states: string[];
  districts: string[];
}

export const AddressLocationSection: React.FC<AddressLocationSectionProps> = ({
  formData,
  setFormData,
  handleChange,
  handleStateChange,
  errors,
  states,
  districts,
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
            
            // Trigger state change to populate districts
            if (newState) {
                handleStateChange(newState);
            }

            setFormData(prev => ({
                ...prev,
                state: newState,
                district: newDistrict,
                city: newCity,
                pincode: newPincode,
            }));
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
    <Suspense fallback={<BeautifulLoader/>}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 pt-2 border-b border-[var(--foreground)/10] mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 text-orange-600 shadow-sm border border-orange-500/10">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-[color:var(--foreground)]">Location Details</h2>
            <p className="text-xs text-[var(--foreground)/60] mt-0.5">Your business address and location</p>
          </div>
        </div>
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
      </div>

      {locationError && (
        <div className="mb-6 -mt-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {locationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Country <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Flag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40]" />
            <input
              type="text"
              name="country"
              value="India"
              readOnly
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] cursor-not-allowed opacity-70 font-medium"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">State <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
              disabled={!states.length}
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200 appearance-none"
            >
              <option value="">Select State</option>
              {states.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--foreground)/40]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">District <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              disabled={!districts.length}
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200 appearance-none"
            >
              <option value="">Select District</option>
              {districts.map(dc => (
                <option key={dc} value={dc}>
                  {dc}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[var(--foreground)/40]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">City <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl text-[color:var(--foreground)] placeholder-[var(--foreground)/40] focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all duration-200"
              placeholder="Enter city"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-[color:var(--foreground)] ml-1">Pincode <span className="text-red-500">*</span></label>
        <div className="relative group">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
          <input
            type="text"
            name="pincode"
            maxLength={6}
            minLength={6}
            value={formData.pincode}
            onChange={handleChange}
            pattern="[0-9]{6}"
            required
            className={`w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border rounded-xl text-[color:var(--foreground)] placeholder-[var(--foreground)/40] focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all duration-200 ${errors.pincode ? 'border-red-500 focus:border-red-500' : 'border-[var(--foreground)/15] focus:border-brand-purple'}`}
            placeholder="Enter 6-digit pincode"
          />
        </div>
        {errors.pincode && <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.pincode}</p>}
      </div>
    </Suspense>
  );
};

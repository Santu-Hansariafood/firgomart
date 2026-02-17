import React, { ChangeEvent, useState } from 'react';
import { MapPin, Flag, Map, Globe, Building2 } from 'lucide-react';
import { SellerFormData } from '@/types/seller';
import { LocationDetector, LocationData } from '@/components/common/LocationDetector/LocationDetector';

interface AddressLocationSectionProps {
  formData: SellerFormData;
  setFormData: React.Dispatch<React.SetStateAction<SellerFormData>>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleStateChange: (state: string) => string[];
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
  const handleLocationDetected = (data: LocationData) => {
    let detectedDistrict = data.district

    let availableDistricts: string[] = []
    if (data.state) {
      availableDistricts = handleStateChange(data.state) || []
    }

    if (availableDistricts.length && detectedDistrict) {
      const normalize = (s: string) =>
        s.toLowerCase().replace(/district/g, '').replace(/\s+/g, ' ').trim()

      const normDetected = normalize(detectedDistrict)

      const exactMatch = availableDistricts.find(
        (d) => normalize(d) === normDetected
      )

      const partialMatch =
        exactMatch ||
        availableDistricts.find(
          (d) =>
            normalize(d).includes(normDetected) ||
            normDetected.includes(normalize(d))
        )

      if (partialMatch) {
        detectedDistrict = partialMatch
      }
    }

    setFormData((prev) => ({
      ...prev,
      state: data.state,
      district: detectedDistrict || prev.district,
      city: data.city,
      pincode: data.pincode,
    }));
  };

  return (
    <>
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
        <LocationDetector onLocationDetected={handleLocationDetected} />
      </div>

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
    </>
  );
};

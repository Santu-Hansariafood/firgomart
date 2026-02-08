import { useState } from 'react'
import locationData from '@/data/country.json'

export const useSellerLocation = (country: string) => {
  const [states] = useState<string[]>(() => {
    const india = locationData.countries.find((c) => c.country === 'India')
    return india ? india.states.map((s) => s.state).sort() : []
  })
  const [districts, setDistricts] = useState<string[]>([])

  const handleStateChange = (selectedState: string) => {
    const countryObj = locationData.countries.find(
      (item) => item.country === country
    )
    const stateObj = countryObj?.states.find((s) => s.state === selectedState)
    const sortedDistricts = stateObj?.districts.sort() ?? []
    setDistricts(sortedDistricts)
    return sortedDistricts
  }

  return {
    states,
    districts,
    setDistricts,
    handleStateChange
  }
}

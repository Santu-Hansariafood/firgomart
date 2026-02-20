import { useState, useEffect, useCallback } from 'react'

export function useGeolocation() {
  const [deliverToState, setDeliverToState] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('deliverToState') || '' : ''
    } catch {
      return ''
    }
  })
  const [countryCode, setCountryCode] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('countryCode') || 'IN' : 'IN'
    } catch {
      return 'IN'
    }
  })
  const [countryName, setCountryName] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('countryName') || '' : ''
    } catch {
      return ''
    }
  })
  const [fullLocation, setFullLocation] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('fullLocation') || '' : ''
    } catch {
      return ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback((s: string | undefined, country?: string | undefined, full?: string | undefined) => {
    const valid = typeof s === 'string' && s.trim().length > 0
    const countryNameRaw = (country || '').trim()
    const countryLower = countryNameRaw.toLowerCase()

    let detectedCode = 'IN'
    if (countryLower.includes('saudi')) detectedCode = 'SA'
    else if (countryLower.includes('united states') || countryLower === 'usa' || countryLower === 'us') detectedCode = 'US'
    else if (countryLower.includes('united arab emirates') || countryLower === 'uae') detectedCode = 'AE'
    else if (countryLower.includes('qatar')) detectedCode = 'QA'
    else if (countryLower.includes('india')) detectedCode = 'IN'

    setCountryCode(detectedCode)
    setCountryName(countryNameRaw || detectedCode)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('countryCode', detectedCode)
        localStorage.setItem('countryName', countryNameRaw || detectedCode)
      }
    } catch {}

    const inIndia = countryLower ? countryLower === 'india' : true

    if (valid && inIndia) {
      setDeliverToState(s!.trim())
      try { localStorage.setItem('deliverToState', s!.trim()) } catch {}

      if (full) {
        setFullLocation(full.trim())
        try { localStorage.setItem('fullLocation', full.trim()) } catch {}
      } else {
        setFullLocation(s!.trim())
        try { localStorage.setItem('fullLocation', s!.trim()) } catch {}
      }
    }
  }, [])

  useEffect(() => {
    const autoLocate = async () => {
      if (deliverToState) return
      try {
        const r = await fetch('https://ipapi.co/json/')
        const j = await r.json()
        const state = j?.region || ''
        const city = j?.city || ''
        const country = j?.country_name || ''
        const postal = j?.postal || j?.postal_code || ''
        let full = city ? `${city}, ${state}` : state
        if (postal) {
          full = city ? `${city}, ${state} ${postal}` : `${state} ${postal}`
        }
        save(state, country, full)
      } catch {}
    }
    autoLocate()
  }, [deliverToState, save])

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!('geolocation' in navigator)) {
        throw new Error("Geolocation not supported")
      }

      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const lat = pos.coords.latitude
              const lon = pos.coords.longitude
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
              const data = await res.json()
              
              const state = data?.principalSubdivision || ''
              const city = data?.city || data?.locality || ''
              const country = data?.countryName || ''
              const postal = data?.postcode || data?.postalCode || ''
              
              let full = city ? `${city}, ${state}` : state

              if (postal) {
                full = city ? `${city}, ${state} ${postal}` : `${state} ${postal}`
              }
              
              save(state, country, full)
              resolve()
            } catch (e) {
              reject(e)
            }
          },
          (err) => {
            setError(err.message)
            reject(err)
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 600000 }
        )
      })
    } catch (err: any) {
      console.error("Geolocation failed", err)
      setError(err.message || "Failed to get location")
    } finally {
      setLoading(false)
    }
  }, [save])

  const updateLocation = useCallback((state: string, country: string) => {
    save(state, country, state)
  }, [save])

  return { deliverToState, fullLocation, countryCode, countryName, requestLocation, loading, error, updateLocation }
}

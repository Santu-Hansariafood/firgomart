import { useState, useEffect, useCallback } from 'react'

type SaveOptions = {
  lockCountry?: boolean
}

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

  const save = useCallback(
    (s: string | undefined, country?: string | undefined, full?: string | undefined, options?: SaveOptions) => {
      const valid = typeof s === 'string' && s.trim().length > 0
      const lockCountry = !!options?.lockCountry

      let existingCode = countryCode
      let existingName = countryName
      try {
        if (typeof window !== 'undefined') {
          existingCode = localStorage.getItem('countryCode') || existingCode
          existingName = localStorage.getItem('countryName') || existingName
        }
      } catch {}

      const countryNameRaw = (country || '').trim()
      const countryLower = countryNameRaw.toLowerCase()

      const mapCountry = () => {
        let detectedCodeLocal = 'IN'
        if (countryLower.includes('saudi')) detectedCodeLocal = 'SA'
        else if (countryLower.includes('united states') || countryLower === 'usa' || countryLower === 'us') detectedCodeLocal = 'US'
        else if (countryLower.includes('united arab emirates') || countryLower === 'uae') detectedCodeLocal = 'AE'
        else if (countryLower.includes('qatar')) detectedCodeLocal = 'QA'
        else if (countryLower.includes('kuwait')) detectedCodeLocal = 'KW'
        else if (countryLower.includes('india')) detectedCodeLocal = 'IN'
        return detectedCodeLocal
      }

      let nextCode = existingCode || 'IN'
      let nextName = existingName

      if (!lockCountry || !existingCode) {
        if (countryNameRaw) {
          nextCode = mapCountry()
          nextName = countryNameRaw || nextCode
        }
      }

      setCountryCode(nextCode)
      setCountryName(nextName || nextCode)
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('countryCode', nextCode)
          localStorage.setItem('countryName', nextName || nextCode)
        }
      } catch {}

      if (valid) {
        const stateVal = s!.trim()
        setDeliverToState(stateVal)
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('deliverToState', stateVal)
          }
        } catch {}

        const loc = full && full.trim().length > 0 ? full.trim() : stateVal
        setFullLocation(loc)
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('fullLocation', loc)
          }
        } catch {}
      }
    },
    [countryCode, countryName]
  )

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
        save(state, country, full, { lockCountry: true })
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
              
              save(state, country, full, { lockCountry: true })
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
    } catch (err) {
      console.error("Geolocation failed", err)
      const msg = err instanceof Error ? err.message : "Failed to get location"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [save])

  const updateLocation = useCallback(
    (state: string, country: string) => {
      const full = [state, country].filter(Boolean).join(', ')
      save(state, country, full, { lockCountry: false })
    },
    [save]
  )

  return { deliverToState, fullLocation, countryCode, countryName, requestLocation, loading, error, updateLocation }
}

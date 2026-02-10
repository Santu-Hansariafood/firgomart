import { useState, useEffect, useCallback } from 'react'

export function useGeolocation() {
  const [deliverToState, setDeliverToState] = useState<string>(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('deliverToState') || '' : ''
    } catch {
      return ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = useCallback((s: string | undefined, country?: string | undefined) => {
    const valid = typeof s === 'string' && s.trim().length > 0
    const inIndia = typeof country === 'string' ? country.trim().toLowerCase() === 'india' : true
    if (valid && inIndia) {
      setDeliverToState(s!.trim())
      try { localStorage.setItem('deliverToState', s!.trim()) } catch {}
    }
  }, [])

  // Only run IP-based geolocation automatically if no state is set
  useEffect(() => {
    const autoLocate = async () => {
      if (deliverToState) return
      try {
        const r = await fetch('https://ipapi.co/json/')
        const j = await r.json()
        const state = j?.region || ''
        const country = j?.country_name || ''
        save(state, country)
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
              const country = data?.countryName || ''
              save(state, country)
              resolve()
            } catch (e) {
              reject(e)
            }
          },
          (err) => {
            setError(err.message)
            reject(err)
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
        )
      })
    } catch (err: any) {
      console.error("Geolocation failed", err)
      setError(err.message || "Failed to get location")
    } finally {
      setLoading(false)
    }
  }, [save])

  const updateLocation = useCallback((state: string) => {
    save(state, 'India')
  }, [save])

  return { deliverToState, requestLocation, loading, error, updateLocation }
}

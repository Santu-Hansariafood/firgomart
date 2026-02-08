import { useState } from 'react'

export const useSellerValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checking, setChecking] = useState<string | null>(null)

  const checkExists = async (field: string, value: string) => {
    if (!value) return
    setChecking(field)
    try {
      const res = await fetch('/api/seller/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      const data = await res.json()
      if (data.exists) {
        let msg = ''
        switch (field) {
          case 'email':
            msg = 'Email already registered'
            break
          case 'phone':
            msg = 'Phone number already registered'
            break
          case 'gstNumber':
            msg = 'GST Number already registered'
            break
          case 'panNumber':
            msg = 'PAN Number already registered'
            break
          default:
            msg = 'Already registered'
        }
        setErrors((prev) => ({ ...prev, [field]: msg }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setChecking(null)
    }
  }

  const validateField = (n: string, v: string) => {
    if (n === 'email')
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email format'
    if (n === 'pincode')
      return /^\d{6}$/.test(v) ? '' : 'Pincode must be 6 digits'
    if (n === 'aadhaar')
      return /^\d{12}$/.test(v) ? '' : 'Aadhaar must be 12 digits'
    if (n === 'panNumber')
      return /^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? '' : 'Invalid PAN format'
    if (n === 'gstNumber')
      return /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(v)
        ? ''
        : 'Invalid GST format'
    if (n === 'bankIfsc')
      return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? '' : 'Invalid IFSC format'
    if (n === 'ownerName')
      return /^[A-Za-z ]{2,}$/.test(v) ? '' : 'Enter a valid name'
    if (n === 'businessName')
      return /^[-&.A-Za-z0-9 ]{2,}$/.test(v)
        ? ''
        : 'Enter a valid business name'
    return ''
  }

  return {
    errors,
    setErrors,
    checking,
    checkExists,
    validateField
  }
}

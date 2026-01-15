import { useState, ChangeEvent, FormEvent } from 'react'
import locationData from '@/data/country.json'

export interface SellerFormData {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  country: string
  state: string
  district: string
  city: string
  pincode: string
  gstNumber: string
  panNumber: string
  aadhaar?: string
  hasGST: boolean
  businessLogo: File | null
  businessLogoUrl?: string
  bankAccount?: string
  bankIfsc?: string
  bankName?: string
  bankBranch?: string
  bankDocumentImage?: string
  bankDocumentUrl?: string
}

export const useSellerRegistration = () => {
  const [formData, setFormData] = useState<SellerFormData>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    country: 'India',
    state: '',
    district: '',
    city: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    hasGST: true,
    businessLogo: null
  })

  const [states, setStates] = useState<string[]>(() => {
    const india = locationData.countries.find(c => c.country === 'India')
    return india ? india.states.map(s => s.state).sort() : []
  })
  const [districts, setDistricts] = useState<string[]>([])
  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('sellerRegSubmitted') === 'true'
    } catch {
      return false
    }
  })
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checking, setChecking] = useState<string | null>(null)
  const [bankDocSrc, setBankDocSrc] = useState<string | null>(null)
  const [croppingBankDoc, setCroppingBankDoc] = useState<boolean>(false)
  const [showAgreementPopup, setShowAgreementPopup] = useState<boolean>(false)
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false)
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false)

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
          case 'email': msg = 'Email already registered'; break;
          case 'phone': msg = 'Phone number already registered'; break;
          case 'gstNumber': msg = 'GST Number already registered'; break;
          case 'panNumber': msg = 'PAN Number already registered'; break;
          default: msg = 'Already registered';
        }
        setErrors(prev => ({ ...prev, [field]: msg }))
      } else {
        setErrors(prev => {
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    let val = value
    
    // Auto-formatting
    if (name === 'panNumber' || name === 'gstNumber' || name === 'bankIfsc') {
      val = val.toUpperCase()
    }
    if (name === 'pincode' || name === 'aadhaar' || name === 'phone') {
      val = val.replace(/\D/g, '')
    }
    if (name === 'email') {
      val = val.trim()
    }
    if (name === 'ownerName' || name === 'businessName') {
      val = val.trim() // Just trim, don't restrict typing yet, validate on blur or change? 
                       // The user request said "regex validiation... in the proper way". 
                       // Real-time validation is usually done on value change but we shouldn't prevent typing spaces if it's a name.
                       // Previous implementation used validation function to set errors, not prevent typing (except digits).
    }

    // Special handling for country (enforce India)
    if (name === 'country' && val !== 'India') {
      // If user tries to change country, force it back or ignore if we want strict 'India only'
      // But for UI select, usually we just don't give other options.
      // If we want to be safe:
      return 
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked ?? false : val
    }))

    // Validation
    const validateField = (n: string, v: string) => {
      if (n === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email format'
      if (n === 'pincode') return /^\d{6}$/.test(v) ? '' : 'Pincode must be 6 digits'
      if (n === 'aadhaar') return /^\d{16}$/.test(v) ? '' : 'Aadhaar must be 16 digits'
      if (n === 'panNumber') return /^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? '' : 'Invalid PAN format'
      if (n === 'gstNumber') return /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(v) ? '' : 'Invalid GST format'
      if (n === 'bankIfsc') return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? '' : 'Invalid IFSC format'
      if (n === 'ownerName') return /^[A-Za-z ]{2,}$/.test(v) ? '' : 'Enter a valid name'
      if (n === 'businessName') return /^[-&.A-Za-z0-9 ]{2,}$/.test(v) ? '' : 'Enter a valid business name'
      return ''
    }

    const err = validateField(name, val)
    setErrors(prev => {
      const next = { ...prev }
      if (err) next[name] = err
      else delete next[name]
      
      // Clear dependent errors if GST toggle changes
      if (name === 'hasGST') {
        delete next.gstNumber
        delete next.panNumber
        delete next.aadhaar
      }
      return next
    })

    // State/District logic
    if (name === 'state') {
      const countryObj = locationData.countries.find(
        item => item.country === formData.country
      )
      const stateObj = countryObj?.states.find(s => s.state === value)
      const sortedDistricts = stateObj?.districts.sort() ?? []
      setDistricts(sortedDistricts)
      setFormData(prev => ({
        ...prev,
        district: '',
        [name]: value // Ensure state is updated (it was done above but logic here relies on value arg)
      }))
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, businessLogo: file }))
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''
      if (cloudName && preset) {
        const form = new FormData()
        form.append('file', file)
        form.append('upload_preset', preset)
        setUploadingLogo(true)
        fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: form,
        })
          .then(res => res.json())
          .then(data => {
            if (data?.secure_url) {
              setFormData(prev => ({ ...prev, businessLogoUrl: data.secure_url }))
            }
          })
          .catch(() => {})
          .finally(() => setUploadingLogo(false))
      }
    }
  }

  const handleBankDocSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : ''
      setBankDocSrc(src)
      setCroppingBankDoc(true)
    }
    reader.readAsDataURL(file)
  }

  const submitRegistration = async () => {
    const payload = {
      ...formData,
      businessLogoUrl: formData.businessLogoUrl,
      documentUrls: [],
      country: formData.country,
      state: formData.state,
    }

    if (payload.hasGST) {
      payload.panNumber = ''
      payload.aadhaar = ''
    } else {
      payload.gstNumber = ''
    }

    if ((formData as any).bankDocumentImage) {
      try {
        const up = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [(formData as any).bankDocumentImage] }),
        })
        const upJson = await up.json()
        if (up.ok && Array.isArray(upJson.urls) && upJson.urls[0]) {
          ;(payload as any).bankDocumentUrl = upJson.urls[0]
        }
      } catch {}
    }

    const res = await fetch('/api/seller/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      setSubmitted(true)
      try { localStorage.setItem('sellerRegSubmitted', 'true') } catch {}
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) return
    if (!agreedToTerms) {
      setErrors(prev => ({ ...prev, agreement: 'Please agree to the terms and conditions' }))
      setPendingSubmit(true)
      setShowAgreementPopup(true)
      return
    }
    await submitRegistration()
  }

  return {
    formData,
    setFormData,
    states,
    districts,
    errors,
    checking,
    uploadingLogo,
    submitted,
    bankDocSrc,
    setBankDocSrc,
    croppingBankDoc,
    setCroppingBankDoc,
    showAgreementPopup,
    setShowAgreementPopup,
    agreedToTerms,
    setAgreedToTerms,
    pendingSubmit,
    setPendingSubmit,
    handleChange,
    handleFileChange,
    handleBankDocSelect,
    handleSubmit,
    checkExists,
    submitRegistration
  }
}

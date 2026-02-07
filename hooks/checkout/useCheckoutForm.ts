import { useState, useEffect, ChangeEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { CheckoutFormData } from '@/types/checkout'

export const useCheckoutForm = () => {
  const { user } = useAuth()
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false)
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  })

  // Load state from local storage
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('deliverToState') || '' : ''
      if (saved) setFormData(prev => ({ ...prev, state: saved }))
    } catch {}
  }, [])

  // Load full address from local storage
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('deliveryAddress') || '' : ''
      if (!raw) return
      const obj = JSON.parse(raw || '{}') as Partial<CheckoutFormData>
      setFormData(prev => ({
        ...prev,
        fullName: obj.fullName || prev.fullName,
        email: obj.email || prev.email,
        phone: obj.phone || prev.phone,
        address: obj.address || prev.address,
        city: obj.city || prev.city,
        state: obj.state || prev.state,
        pincode: obj.pincode || prev.pincode,
        country: obj.country || prev.country,
      }))
    } catch {}
  }, [])

  // Save address to local storage
  useEffect(() => {
    try {
      if (formData.email || formData.fullName) {
        localStorage.setItem('deliveryAddress', JSON.stringify(formData))
      }
    } catch {}
  }, [formData])

  // Sync with user profile
  useEffect(() => {
    if (!user) return
    const u = user as any
    const addresses = Array.isArray(u.addresses) ? u.addresses : []
    
    let defaultAddr = addresses.find((a: any) => a.isDefault === true || String(a.isDefault) === 'true')
    
    if (!defaultAddr && addresses.length > 0) {
      defaultAddr = addresses[0]
    }
    
    setFormData(prev => {
      const newAddress = defaultAddr?.address || u.address || prev.address
      const newCity = defaultAddr?.city || u.city || prev.city
      const newState = defaultAddr?.state || u.state || prev.state
      const newPincode = defaultAddr?.pincode || u.pincode || prev.pincode
      const newCountry = defaultAddr?.country || u.country || prev.country
      
      return {
        ...prev,
        fullName: u.name || prev.fullName,
        email: u.email || prev.email,
        phone: u.mobile || u.phone || prev.phone,
        address: newAddress,
        city: newCity,
        state: newState,
        pincode: newPincode,
        country: newCountry,
      }
    })
    try {
      const st = defaultAddr?.state || u.state
      if (st) localStorage.setItem('deliverToState', st)
    } catch {}
  }, [user])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectAddress = (addr: any) => {
    const u = user as any
    setFormData(prev => ({
      ...prev,
      fullName: u?.name || prev.fullName,
      email: u?.email || prev.email,
      phone: u?.mobile || u?.phone || prev.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || 'India',
    }))
    setShowAddressModal(false)
  }

  const handleAddNewAddress = () => {
    const u = user as any
    setFormData({
      fullName: u?.name || '',
      email: u?.email || '',
      phone: u?.mobile || u?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    })
    setShowAddressModal(false)
  }

  return {
    formData,
    setFormData,
    handleChange,
    handleSelectAddress,
    handleAddNewAddress,
    showAddressModal,
    setShowAddressModal,
    user
  }
}

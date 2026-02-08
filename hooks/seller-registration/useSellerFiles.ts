import { useState, ChangeEvent } from 'react'
import { SellerFormData } from '../../types/seller'

export const useSellerFiles = (
  setFormData: React.Dispatch<React.SetStateAction<SellerFormData>>
) => {
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [bankDocSrc, setBankDocSrc] = useState<string | null>(null)
  const [croppingBankDoc, setCroppingBankDoc] = useState(false)

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, businessLogo: file }))
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
          .then((res) => res.json())
          .then((data) => {
            if (data?.secure_url) {
              setFormData((prev) => ({
                ...prev,
                businessLogoUrl: data.secure_url,
              }))
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
    e.target.value = ''
  }

  return {
    uploadingLogo,
    bankDocSrc,
    setBankDocSrc,
    croppingBankDoc,
    setCroppingBankDoc,
    handleLogoUpload,
    handleBankDocSelect,
  }
}

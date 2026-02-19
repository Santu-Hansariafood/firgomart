"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import categoriesData from "@/data/categories.json"
import dynamic from "next/dynamic"
import { Megaphone, Plus, Edit2, Trash2, X, Save, Check, AlertCircle, LayoutGrid, List, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"

const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))

type Offer = {
  _id: string
  key: string
  name: string
  type: "discount-min" | "pack-min" | "search" | "category"
  category?: string
  subcategory?: string
  products?: string[]
  value?: string | number
  active: boolean
  expiryDate?: string
  order: number
  availableCountry?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function MarketingClient() {
  const { data: session } = useSession()
  const { user: authUser, loading: authLoading } = useAuth()
  
  const [offers, setOffers] = useState<Offer[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"offers" | "banners">("offers")
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<{
    key: string
    name: string
    type: "discount-min" | "pack-min" | "search" | "category"
    category: string
    subcategory: string
    products: string
    value: string
    availableCountry: string
    active: boolean
    expiryDate: string
    order: number
  }>({
    key: "",
    name: "",
    type: "discount-min",
    category: "",
    subcategory: "",
    products: "",
    value: "",
    availableCountry: "",
    active: true,
    expiryDate: "",
    order: 0
  })

  const [bannerFormData, setBannerFormData] = useState<{
    title: string
    description: string
    buttonText: string
    image: string
    section: string
    linkType: "product" | "category" | "external"
    linkId: string
    availableCountry: string
    active: boolean
    order: number
  }>({
    title: "",
    description: "",
    buttonText: "",
    image: "",
    section: "hero",
    linkType: "product",
    linkId: "",
    availableCountry: "",
    active: true,
    order: 0
  })

  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  useEffect(() => {
    if (!allowed) return
    fetchOffers()
    fetchBanners()
    fetchProducts()
  }, [allowed])

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/admin/offers")
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers || [])
      }
    } catch (e) { console.error(e) }
  }

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners")
      if (res.ok) {
        const data = await res.json()
        setBanners(data.banners || [])
      }
    } catch (e) { console.error(e) }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?limit=100")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (e) { console.error(e) }
  }

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      type: "discount-min",
      category: "",
      subcategory: "",
      products: "",
      value: "",
      availableCountry: "",
      active: true,
      expiryDate: "",
      order: 0
    })
    setEditingId(null)
    setIsEditing(false)
    setError("")
  }

  const handleEdit = (offer: Offer) => {
    setFormData({
      key: offer.key,
      name: offer.name,
      type: offer.type,
      category: offer.category || "",
      subcategory: offer.subcategory || "",
      products: (offer.products || []).join(", "),
      value: String(offer.value || ""),
      availableCountry: offer.availableCountry || "",
      active: offer.active,
      expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : "",
      order: offer.order || 0
    })
    setEditingId(offer._id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offer?")) return
    
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch("/api/admin/offers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ id }),
      })
      
      if (res.ok) {
        setOffers(prev => prev.filter(o => o._id !== id))
        toast.success("Offer deleted successfully")
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to delete")
      }
    } catch (err) {
      toast.error("Error deleting offer")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const method = editingId ? "PUT" : "POST"
      
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...formData,
        products: formData.products.split(",").map(s => s.trim()).filter(Boolean),
        value: !isNaN(Number(formData.value)) && formData.value !== "" ? Number(formData.value) : formData.value
      }

      const res = await fetch("/api/admin/offers", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (editingId) {
          setOffers(prev => prev.map(o => o._id === editingId ? data.offer : o))
        } else {
          setOffers(prev => [...prev, data.offer])
        }
        resetForm()
        toast.success(editingId ? "Offer updated successfully" : "Offer created successfully")
      } else {
        const d = await res.json()
        setError(d.error || "Failed to save")
      }
    } catch (err) {
      setError("Error saving offer")
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    
    if (!cloudName || !preset) {
      throw new Error("Cloudinary configuration missing")
    }

    const fd = new FormData()
    fd.append("file", file)
    fd.append("upload_preset", preset)
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: fd,
    })
    
    const data = await res.json()
    if (!data?.secure_url) throw new Error("Upload failed")
    return String(data.secure_url)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const url = await uploadToCloudinary(file)
      setBannerFormData(prev => ({ ...prev, image: url }))
      toast.success("Image uploaded successfully")
    } catch (err) {
      toast.error("Failed to upload image")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const resetBannerForm = () => {
    setBannerFormData({
      title: "",
      description: "",
      buttonText: "",
      image: "",
      section: "hero",
      linkType: "product",
      linkId: "",
      availableCountry: "",
      active: true,
      order: 0
    })
    setEditingId(null)
    setIsEditing(false)
    setError("")
  }

  const handleBannerEdit = (banner: any) => {
    setBannerFormData({
      title: banner.title,
      description: banner.description,
      buttonText: banner.buttonText,
      image: banner.image,
      section: banner.section || "hero",
      linkType: banner.linkType,
      linkId: banner.linkId || "",
      availableCountry: banner.availableCountry || "",
      active: banner.active,
      order: banner.order || 0
    })
    setEditingId(banner._id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBannerDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return
    
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ id }),
      })
      
      if (res.ok) {
        setBanners(prev => prev.filter(b => b._id !== id))
        toast.success("Banner deleted successfully")
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to delete")
      }
    } catch (err) {
      toast.error("Error deleting banner")
    }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const method = editingId ? "PUT" : "POST"
      
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        ...bannerFormData
      }

      const res = await fetch("/api/admin/banners", {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        if (editingId) {
          setBanners(prev => prev.map(b => b._id === editingId ? data.banner : b))
        } else {
          setBanners(prev => [...prev, data.banner])
        }
        resetBannerForm()
        toast.success(editingId ? "Banner updated successfully" : "Banner created successfully")
      } else {
        const d = await res.json()
        setError(d.error || "Failed to save")
      }
    } catch (err) {
      setError("Error saving banner")
    }
  }

  if (authLoading) return <BeautifulLoader />
  if (!allowed) return <AdminLogin />

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gray-50/50">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing & Promotions</h1>
            <p className="text-white/80 mt-2 text-lg">Manage active offers, discounts, and campaign banners</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="relative z-10 mt-8 flex gap-3">
            <button 
                onClick={() => { setActiveTab("offers"); resetForm(); }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === "offers" ? "bg-white text-indigo-600 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
                Offers
            </button>
            <button 
                onClick={() => { setActiveTab("banners"); resetBannerForm(); }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === "banners" ? "bg-white text-indigo-600 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
                Banners
            </button>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {isEditing ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
                {isEditing 
                  ? (activeTab === 'offers' ? "Edit Offer" : "Edit Banner") 
                  : (activeTab === 'offers' ? "Create New Offer" : "Create New Banner")
                }
              </h2>
              {isEditing && (
                <button 
                  onClick={activeTab === 'offers' ? resetForm : resetBannerForm}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-start gap-2"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'offers' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Offer Key</label>
                <input
                  type="text"
                  required
                  value={formData.key}
                  onChange={e => setFormData({...formData, key: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="SUMMER2024"
                />
                <p className="text-xs text-gray-400">Unique identifier for internal use</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Summer Sale"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="discount-min">Discount (Min Order)</option>
                    <option value="pack-min">Pack Size (Min Order)</option>
                    <option value="search">Search Keyword</option>
                    <option value="category">Category Specific</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Product Category <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                  <CommonDropdown
                    options={categoriesData.categories.map(c => ({ id: c.name, label: c.name }))}
                    selected={formData.category ? { id: formData.category, label: formData.category } : null}
                    onChange={(opt) => {
                      if (!Array.isArray(opt)) {
                        setFormData({
                          ...formData, 
                          category: String(opt.label),
                          subcategory: ""
                        })
                      }
                    }}
                    placeholder="Select Category (All)"
                    className="w-full"
                  />
                </div>

                {formData.category && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Product Type (Subcategory) <span className="text-xs text-gray-400 font-normal">(Optional)</span></label>
                    <CommonDropdown
                      options={(
                        categoriesData.categories.find(c => c.name === formData.category)?.subcategories || []
                      ).map(s => ({ id: s, label: s }))}
                      selected={formData.subcategory ? { id: formData.subcategory, label: formData.subcategory } : null}
                      onChange={(opt) => {
                        if (!Array.isArray(opt)) {
                          setFormData({...formData, subcategory: String(opt.label)})
                        }
                      }}
                      placeholder="Select Subcategory (All)"
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Product IDs <span className="text-xs text-gray-400 font-normal">(Comma separated)</span></label>
                  <textarea
                    value={formData.products}
                    onChange={e => setFormData({...formData, products: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-20"
                    placeholder="e.g. 64f123..., 64f456..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Value</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. 20 (for 20% off) or 'Electronics'"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Available Country</label>
                <select
                  value={formData.availableCountry}
                  onChange={e => setFormData({ ...formData, availableCountry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Countries</option>
                  <option value="IN">India</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="US">United States</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="QA">Qatar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                    {formData.active && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={e => setFormData({...formData, active: e.target.checked})}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? "Update Offer" : "Create Offer"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            ) : (
                <form onSubmit={handleBannerSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Banner Title</label>
                <input
                  type="text"
                  required
                  value={bannerFormData.title}
                  onChange={e => setBannerFormData({...bannerFormData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Summer Collection Launch"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  required
                  value={bannerFormData.description}
                  onChange={e => setBannerFormData({...bannerFormData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-24"
                  placeholder="Discover our new summer essentials..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Button Text</label>
                  <input
                    type="text"
                    required
                    value={bannerFormData.buttonText}
                    onChange={e => setBannerFormData({...bannerFormData, buttonText: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Target Country (optional)</label>
                  <input
                    type="text"
                    value={bannerFormData.availableCountry}
                    onChange={e => setBannerFormData({
                      ...bannerFormData,
                      availableCountry: e.target.value.toUpperCase()
                    })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. IN, SA, US"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Ad Section</label>
                  <div className="relative">
                    <select
                      value={bannerFormData.section}
                      onChange={e => setBannerFormData({...bannerFormData, section: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="hero">Hero (Home)</option>
                      <option value="featured">Featured</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Banner Image</label>
                <div className="space-y-3">
                  {!bannerFormData.image ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-500 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors mb-2" />
                        )}
                        <p className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">
                          {uploading ? "Uploading..." : "Click to upload image"}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  ) : (
                    <div className="relative h-48 w-full rounded-xl overflow-hidden border border-gray-200 group">
                      <img 
                        src={bannerFormData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-700" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setBannerFormData({...bannerFormData, image: ""})}
                          className="p-2 bg-white rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Link Type</label>
                <div className="relative">
                  <select
                    value={bannerFormData.linkType}
                    onChange={e => setBannerFormData({...bannerFormData, linkType: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="external">External Link</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {bannerFormData.linkType !== 'external' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">
                        {bannerFormData.linkType === 'product' ? 'Product ID' : 'Category Name'}
                    </label>
                    <input
                      type="text"
                      value={bannerFormData.linkId}
                      onChange={e => setBannerFormData({...bannerFormData, linkId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      placeholder={bannerFormData.linkType === 'product' ? 'Product ID' : 'Category Name'}
                    />
                  </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Sort Order</label>
                <input
                  type="number"
                  value={bannerFormData.order}
                  onChange={e => setBannerFormData({...bannerFormData, order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${bannerFormData.active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                    {bannerFormData.active && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={bannerFormData.active}
                    onChange={e => setBannerFormData({...bannerFormData, active: e.target.checked})}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  {isEditing ? "Update Banner" : "Create Banner"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetBannerForm}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-2"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <List className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">{activeTab === 'offers' ? 'Active Offers' : 'Active Banners'}</h2>
                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {activeTab === 'offers' ? offers.length : banners.length}
                </span>
              </div>
              {loading && <div className="text-sm text-gray-500 animate-pulse">Syncing...</div>}
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
              {activeTab === 'offers' ? (
                  offers.length === 0 && !loading ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No offers yet</h3>
                  <p className="text-gray-500 mt-1">Create your first marketing offer to get started.</p>
                </div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {offers.map(offer => (
                    <motion.div 
                      key={offer._id}
                      variants={itemVariants}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-5 hover:bg-gray-50 transition-colors flex items-start justify-between group border-l-4 ${offer.active ? 'border-l-green-500' : 'border-l-gray-300'}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${offer.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {offer.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {offer.type}
                          </span>
                          {offer.order > 0 && (
                            <span className="text-xs text-gray-400 font-medium">#{offer.order}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{offer.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-gray-400">Key:</span> 
                            <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{offer.key}</span>
                          </span>
                          {offer.value && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-400">Value:</span>
                              <span className="text-gray-900 font-medium">{offer.value}</span>
                            </span>
                          )}
                          {offer.expiryDate && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-400">Expires:</span>
                              <span className="text-red-600 font-medium">{new Date(offer.expiryDate).toLocaleDateString()}</span>
                            </span>
                          )}
                          {offer.category && (
                            <span className="flex items-center gap-1">
                              <span className="font-medium text-gray-400">Category:</span>
                              <span className="text-gray-900 font-medium">{offer.category} {offer.subcategory ? `> ${offer.subcategory}` : ''}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors hover:shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors hover:shadow-sm border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )
              ) : (
                banners.length === 0 && !loading ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Megaphone className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No banners yet</h3>
                  <p className="text-gray-500 mt-1">Create your first banner to get started.</p>
                </div>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {banners.map(banner => (
                    <motion.div 
                      key={banner._id}
                      variants={itemVariants}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-5 hover:bg-gray-50 transition-colors flex items-start justify-between group border-l-4 ${banner.active ? 'border-l-green-500' : 'border-l-gray-300'}`}
                    >
                      <div className="flex gap-4">
                          <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {banner.active ? 'Active' : 'Inactive'}
                              </span>
                              {banner.order > 0 && (
                                <span className="text-xs text-gray-400 font-medium">#{banner.order}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{banner.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{banner.description}</p>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => handleBannerEdit(banner)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors hover:shadow-sm border border-transparent hover:border-blue-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBannerDelete(banner._id)}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors hover:shadow-sm border border-transparent hover:border-red-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

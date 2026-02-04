"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import categoriesData from "@/data/categories.json"
import dynamic from "next/dynamic"
import { Megaphone, Plus, Edit2, Trash2, X, Save, Check, AlertCircle, LayoutGrid, List } from "lucide-react"
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
  value?: string | number
  active: boolean
  expiryDate?: string
  order: number
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Edit/Create State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<{
    key: string
    name: string
    type: "discount-min" | "pack-min" | "search" | "category"
    category: string
    subcategory: string
    value: string
    active: boolean
    expiryDate: string
    order: number
  }>({
    key: "",
    name: "",
    type: "discount-min",
    category: "",
    subcategory: "",
    value: "",
    active: true,
    expiryDate: "",
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
  }, [allowed])

  const fetchOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/offers")
      if (res.ok) {
        const data = await res.json()
        setOffers(data.offers || [])
      } else {
        setError("Failed to fetch offers")
      }
    } catch (err) {
      setError("Error fetching offers")
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      type: "discount-min",
      category: "",
      subcategory: "",
      value: "",
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
      value: String(offer.value || ""),
      active: offer.active,
      expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : "",
      order: offer.order || 0
    })
    setEditingId(offer._id)
    setIsEditing(true)
    // Scroll to form
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
        // Convert value to number if it looks like one, otherwise string
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
        
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl"></div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
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
                {isEditing ? "Edit Offer" : "Create New Offer"}
              </h2>
              {isEditing && (
                <button 
                  onClick={resetForm}
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
                          subcategory: "" // reset subcategory when category changes
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
          </div>
        </motion.div>

        {/* List Section */}
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
                <h2 className="text-lg font-bold text-gray-800">Active Offers</h2>
                <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {offers.length}
                </span>
              </div>
              {loading && <div className="text-sm text-gray-500 animate-pulse">Syncing...</div>}
            </div>
            
            <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
              {offers.length === 0 && !loading ? (
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
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

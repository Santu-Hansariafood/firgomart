"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import Image from "next/image"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import { categories as categoryList } from "@/data/mockData"

type Seller = {
  _id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  status: string
  address?: string
  country?: string
  state?: string
  district?: string
  city?: string
  pincode?: string
  gstNumber?: string
  panNumber?: string
  hasGST?: boolean
  businessLogoUrl?: string
}

type Product = {
  _id: string
  name: string
  image: string
  images?: string[]
  category: string
  price: number
}

export default function AdminPage() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [approvedSellers, setApprovedSellers] = useState<Seller[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; label: string } | null>(null)
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const [selectedSellerDetails, setSelectedSellerDetails] = useState<Seller | null>(null)
  const [savingSeller, setSavingSeller] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState<string>("")
  const [editDetails, setEditDetails] = useState<string>("")

  const sanitizeImageUrl = (src: string) => {
    // Trim whitespace and remove stray trailing parentheses
    return (src || "").trim().replace(/[)]+$/g, "")
  }

  const isCloudinaryUrl = (src: string) => {
    try {
      const u = new URL(sanitizeImageUrl(src))
      return u.hostname === "res.cloudinary.com"
    } catch {
      return false
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    if (!cloudName || !preset) {
      throw new Error("Cloudinary env not configured: NEXT_PUBLIC_CLOUDINARY_*")
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

  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || (authUser as any)?.role === "admin"
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  useEffect(() => {
    if (!allowed) return
    const run = async () => {
      setLoading(true)
      try {
        const sRes = await fetch("/api/admin/sellers?status=pending")
        const sData = await sRes.json()
        if (sRes.ok) setSellers(sData.sellers || [])
        const aRes = await fetch("/api/admin/sellers?status=approved")
        const aData = await aRes.json()
        if (aRes.ok) setApprovedSellers(aData.sellers || [])
        const pRes = await fetch("/api/products?limit=20&page=1&adminOnly=true")
        const pData = await pRes.json()
        if (pRes.ok) setProducts(pData.products || [])
      } catch {}
      setLoading(false)
    }
    run()
  }, [allowed])

  const approveSeller = async (id: string) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      })
      if (res.ok) {
        setSellers(prev => prev.filter(s => s._id !== id))
        // Optionally refetch approved list
        try {
          const aRes = await fetch("/api/admin/sellers?status=approved")
          const aData = await aRes.json()
          if (aRes.ok) setApprovedSellers(aData.sellers || [])
        } catch {}
      }
    } catch {}
  }

  const viewSellerProducts = async (seller: Seller) => {
    try {
      setSelectedSeller(seller)
      const res = await fetch(`/api/products?limit=50&page=1&createdByEmail=${encodeURIComponent(seller.email)}`)
      const data = await res.json()
      if (res.ok) setSellerProducts(data.products || [])
      else setSellerProducts([])
    } catch {
      setSellerProducts([])
    }
  }

  const viewSellerDetails = async (sellerId: string) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`)
      const data = await res.json()
      if (res.ok) setSelectedSellerDetails(data.seller)
      else setSelectedSellerDetails(null)
    } catch {
      setSelectedSellerDetails(null)
    }
  }

  const saveSellerDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSellerDetails) return
    setSavingSeller(true)
    const fd = new FormData(e.target as HTMLFormElement)
    const payload: Partial<Seller> = {
      businessName: String(fd.get("businessName") || ""),
      ownerName: String(fd.get("ownerName") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      district: String(fd.get("district") || ""),
      pincode: String(fd.get("pincode") || ""),
      gstNumber: String(fd.get("gstNumber") || ""),
      panNumber: String(fd.get("panNumber") || ""),
      status: String(fd.get("status") || selectedSellerDetails.status || "pending"),
    }
    try {
      const res = await fetch(`/api/admin/sellers/${selectedSellerDetails._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedSellerDetails(data.seller)
        // Refresh approved list to reflect changes
        try {
          const aRes = await fetch("/api/admin/sellers?status=approved")
          const aData = await aRes.json()
          if (aRes.ok) setApprovedSellers(aData.sellers || [])
        } catch {}
      }
    } catch {}
    setSavingSeller(false)
  }

  const createProduct = async (p: Partial<Product>) => {
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(p),
      })
      if (res.ok) {
        const d = await res.json()
        setProducts(prev => [d.product, ...prev])
      }
    } catch {}
  }

  const startEditProduct = (p: any) => {
    setEditingProductId(p._id)
    setEditDescription(typeof p.description === 'string' ? p.description : '')
    setEditDetails(typeof (p as any).details === 'string' ? (p as any).details : '')
  }

  const cancelEditProduct = () => {
    setEditingProductId(null)
    setEditDescription("")
    setEditDetails("")
  }

  const saveEditProduct = async () => {
    if (!editingProductId) return
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/products/${editingProductId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
        },
        body: JSON.stringify({ description: editDescription, details: editDetails }),
      })
      const data = await res.json()
      if (res.ok) {
        const updated = data.product
        setProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)))
        setSellerProducts(prev => prev.map(p => (p._id === updated._id ? updated : p)))
        cancelEditProduct()
      } else {
        alert(data?.error || 'Update failed')
      }
    } catch {
      alert('Network error')
    }
  }

  if (!allowed) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Admin Dashboard</h1>
          {loading && <p className="text-sm text-gray-500 mt-2">Loading...</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Pending Sellers</h2>
            <div className="space-y-3">
              {sellers.map(s => (
                <div key={s._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.businessName}</p>
                    <p className="text-sm text-gray-600">{s.ownerName} • {s.email} • {s.phone}</p>
                  </div>
                  <button onClick={() => approveSeller(s._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg">Approve</button>
                </div>
              ))}
              {sellers.length === 0 && <p className="text-sm text-gray-500">No pending sellers</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Products</h2>
            <form
              onSubmit={e => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const fd = new FormData(form)
                const p: Partial<Product> = {
                  name: String(fd.get("name") || ""),
                  image: "",
                  price: Number(fd.get("price") || 0),
                }
                const chosen = selectedCategory
                p.category = chosen ? String((chosen as any).label) : ""

                const run = async () => {
                  setUploadingImages(true)
                  try {
                    if (!mainImageFile) throw new Error("Please select a product image to upload")
                    const mainUrl = await uploadToCloudinary(mainImageFile)
                    p.image = mainUrl
                    const extras: string[] = []
                    for (const f of extraImageFiles) {
                      const url = await uploadToCloudinary(f)
                      extras.push(url)
                    }
                    if (extras.length > 0) (p as any).images = extras
                    await createProduct(p)
                    form.reset()
                    setSelectedCategory(null)
                    setMainImageFile(null)
                    setExtraImageFiles([])
                  } catch (err) {
                    alert((err as Error)?.message || "Upload/Create failed")
                  } finally {
                    setUploadingImages(false)
                  }
                }
                run()
              }}
              className="space-y-3 mb-6"
            >
              <div className="grid md:grid-cols-2 gap-3">
                <input name="name" placeholder="Name" className="px-3 py-2 border rounded" required />
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Product Image (upload)</label>
                  <input type="file" accept="image/*" onChange={e => setMainImageFile(e.target.files?.[0] || null)} required className="px-3 py-2 border rounded" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Extra Images (optional)</label>
                  <input type="file" accept="image/*" multiple onChange={e => setExtraImageFiles(Array.from(e.target.files || []))} className="px-3 py-2 border rounded" />
                </div>
                <CommonDropdown
                  label="Category"
                  placeholder="Select category"
                  options={categoryList.map(c => ({ id: c.id, label: c.name }))}
                  selected={selectedCategory}
                  onChange={(sel) => setSelectedCategory(sel as any)}
                  className="w-full"
                />
                <input name="price" type="number" step="0.01" placeholder="Price" className="px-3 py-2 border rounded" required />
              </div>
              <button type="submit" disabled={uploadingImages} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {uploadingImages ? "Uploading..." : "Create"}
              </button>
            </form>

            <div className="space-y-3">
              {products.map(p => (
                <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      {isCloudinaryUrl((Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : p.image) ? (
                        <Image
                          src={sanitizeImageUrl((Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : p.image)}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <img
                          src={sanitizeImageUrl((Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : p.image)}
                          alt={p.name}
                          className="object-cover w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.category} • ₹{p.price}</p>
                      {editingProductId === p._id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            placeholder="Description"
                            className="w-full px-3 py-2 border rounded"
                            rows={2}
                          />
                          <textarea
                            value={editDetails}
                            onChange={e => setEditDetails(e.target.value)}
                            placeholder="Details"
                            className="w-full px-3 py-2 border rounded"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button onClick={saveEditProduct} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
                            <button onClick={cancelEditProduct} className="px-3 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-gray-500 line-clamp-2">{(p as any).description || 'No description'}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{p._id}</span>
                    {editingProductId === p._id ? (
                      <button onClick={cancelEditProduct} className="text-sm px-3 py-1 bg-gray-100 rounded">Close</button>
                    ) : (
                      <button onClick={() => startEditProduct(p)} className="text-sm px-3 py-1 bg-gray-100 rounded">Edit</button>
                    )}
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-gray-500">No products</p>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Registered Sellers</h2>
            <div className="space-y-3">
              {approvedSellers.map(s => (
                <div key={s._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.businessName}</p>
                    <p className="text-sm text-gray-600">{s.ownerName} • {s.email} • {s.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => viewSellerProducts(s)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">View products</button>
                    <button onClick={() => viewSellerDetails(s._id)} className="px-4 py-2 bg-gray-800 text-white rounded-lg">View details</button>
                  </div>
                </div>
              ))}
              {approvedSellers.length === 0 && <p className="text-sm text-gray-500">No registered sellers</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Seller Products</h2>
            <p className="text-sm text-gray-600 mb-4">{selectedSeller ? `Showing products for ${selectedSeller.businessName}` : "Select a seller to view products"}</p>
            <div className="space-y-3">
              {sellerProducts.map(p => (
                <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      {isCloudinaryUrl((Array.isArray(p.images) && p.images.length > 0) ? (p.images as string[])[0] : p.image) ? (
                        <Image
                          src={sanitizeImageUrl((Array.isArray(p.images) && p.images.length > 0) ? (p.images as string[])[0] : p.image)}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <img
                          src={sanitizeImageUrl((Array.isArray(p.images) && p.images.length > 0) ? (p.images as string[])[0] : p.image)}
                          alt={p.name}
                          className="object-cover w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.category} • ₹{p.price}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{p._id}</span>
                </div>
              ))}
              {sellerProducts.length === 0 && <p className="text-sm text-gray-500">No products to show</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Seller Details</h2>
          {!selectedSellerDetails && <p className="text-sm text-gray-600">Choose "View details" on a registered seller to edit.</p>}
          {selectedSellerDetails && (
            <form onSubmit={saveSellerDetails} className="grid md:grid-cols-2 gap-3">
              <input name="businessName" defaultValue={selectedSellerDetails.businessName} placeholder="Business Name" className="px-3 py-2 border rounded" />
              <input name="ownerName" defaultValue={selectedSellerDetails.ownerName} placeholder="Owner Name" className="px-3 py-2 border rounded" />
              <input name="email" defaultValue={selectedSellerDetails.email} placeholder="Email" className="px-3 py-2 border rounded" />
              <input name="phone" defaultValue={selectedSellerDetails.phone} placeholder="Phone" className="px-3 py-2 border rounded" />
              <input name="address" defaultValue={selectedSellerDetails.address || ""} placeholder="Address" className="px-3 py-2 border rounded md:col-span-2" />
              <input name="city" defaultValue={selectedSellerDetails.city || ""} placeholder="City" className="px-3 py-2 border rounded" />
              <input name="state" defaultValue={selectedSellerDetails.state || ""} placeholder="State" className="px-3 py-2 border rounded" />
              <input name="district" defaultValue={selectedSellerDetails.district || ""} placeholder="District" className="px-3 py-2 border rounded" />
              <input name="pincode" defaultValue={selectedSellerDetails.pincode || ""} placeholder="Pincode" className="px-3 py-2 border rounded" />
              <input name="gstNumber" defaultValue={selectedSellerDetails.gstNumber || ""} placeholder="GST Number" className="px-3 py-2 border rounded" />
              <input name="panNumber" defaultValue={selectedSellerDetails.panNumber || ""} placeholder="PAN Number" className="px-3 py-2 border rounded" />
              <select name="status" defaultValue={selectedSellerDetails.status} className="px-3 py-2 border rounded">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="md:col-span-2 flex gap-2 mt-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={savingSeller}>{savingSeller ? "Saving..." : "Save"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

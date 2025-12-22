"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { categories as categoryList } from "@/data/mockData"
import Image from "next/image"
import dynamic from "next/dynamic"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))

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

export default function AdminPageClient() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const router = useRouter()
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
        setProducts(prev => prev.map(p => p._id === editingProductId ? { ...p, description: editDescription, details: editDetails } as any : p))
        cancelEditProduct()
      }
    } catch {}
  }

  const modules = [
    { title: 'Dashboard', items: ['Sales, orders, revenue', 'Live order status', 'Active buyers & sellers', 'Top products & categories'] },
    { title: 'Buyer Management', items: ['Buyer list', 'Block/Unblock', 'Order history'] },
    { title: 'Seller Management', items: ['Seller KYC verification', 'Approve/Reject seller', 'Commission setup', 'Seller payouts & performance'] },
    { title: 'Product Management', items: ['Add/Edit/Delete products', 'Product approval', 'Category management', 'Price, stock, discount control'] },
    { title: 'Inventory Management', items: ['Stock level', 'Low-stock alerts', 'Seller stock sync'] },
    { title: 'Order Management', items: ['View all orders', 'Status update (Packed/Shipped/Delivered/Return)', 'Cancel/Refund/Replacement', 'Shipping label & invoice'] },
    { title: 'Logistics Management', items: ['Courier integration', 'Assign courier', 'Shipment tracking', 'NDR/RTO handling'] },
    { title: 'Payments & Finance', items: ['Buyer payment logs', 'Failed transactions', 'Seller settlement', 'Commission reports', 'GST/TCS reports'] },
    { title: 'Marketing & Promotions', items: ['Coupons', 'Offers', 'Banners', 'Push notifications'] },
    { title: 'Customer Support', items: ['Tickets', 'Disputes', 'Refund approvals', 'Communication logs'] },
    { title: 'CMS (Content Management)', items: ['Homepage banners', 'Static pages (About, Terms, Privacy, Refund Policy)', 'Category display control'] },
    { title: 'Security & Roles', items: ['Admin roles & permissions', 'Activity logs', 'Fraud detection'] },
    { title: 'Reports & Analytics', items: ['Sales reports', 'Seller reports', 'Product performance', 'Region-wise analytics'] },
    { title: 'Global Selling (Optional)', items: ['Country-wise pricing', 'International courier setup', 'Export rules', 'Currency conversion'] },
  ]

  const moduleRoutes: Record<string, string> = {
    'Dashboard': '/admin',
    'Buyer Management': '/admin/buyers',
    'Seller Management': '/admin/sellers',
    'Product Management': '/admin/products',
    'Inventory Management': '/admin/inventory',
    'Order Management': '/admin/orders',
    'Logistics Management': '/admin/logistics',
    'Payments & Finance': '/admin/finance',
    'Marketing & Promotions': '/admin/marketing',
    'Customer Support': '/admin/support',
    'CMS (Content Management)': '/admin/cms',
    'Security & Roles': '/admin/security',
    'Reports & Analytics': '/admin/reports',
    'Global Selling (Optional)': '/admin/global-selling',
  }

  // Render
  if (!allowed) return <AdminLogin />

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <section id="admin-modules">
        <h2 className="text-xl font-medium">Admin Modules Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {modules.map((m, i) => (
            <div
              key={i}
              className="border rounded p-4 bg-white cursor-pointer hover:shadow"
              onClick={() => {
                const route = moduleRoutes[m.title]
                if (route) router.push(route)
              }}
            >
              <div className="font-semibold mb-2">{m.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sellers Section */}
      <section id="seller-section">
        <h2 className="text-xl font-medium">Pending Sellers</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellers.map(s => (
              <div key={s._id} className="border rounded p-3 flex items-center gap-3">
                {s.businessLogoUrl ? (
                  <Image src={sanitizeImageUrl(s.businessLogoUrl)} alt={s.businessName} width={48} height={48} className="rounded" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{s.businessName}</div>
                  <div className="text-sm text-gray-600">{s.email} • {s.phone}</div>
                </div>
                <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => approveSeller(s._id)}>Approve</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => viewSellerDetails(s._id)}>Details</button>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => viewSellerProducts(s)}>Products</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Sellers */}
      <section>
        <h2 className="text-xl font-medium">Approved Sellers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedSellers.map(s => (
            <div key={s._id} className="border rounded p-3">
              <div className="font-medium">{s.businessName}</div>
              <div className="text-sm text-gray-600">{s.email} • {s.phone}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="product-section">
        <h2 className="text-xl font-medium">Products</h2>
        <div className="flex items-center gap-3 mb-3">
          <CommonDropdown
            options={categoryList.map((c, i) => ({ id: i, label: c.name }))}
            selected={selectedCategory as any}
            onChange={setSelectedCategory as any}
            placeholder="Filter by category"
          />
          <button className="px-3 py-1 bg-gray-800 text-white rounded" onClick={() => setSelectedCategory(null)}>Clear</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products
            .filter(p => !selectedCategory || p.category === selectedCategory.label)
            .map(p => (
              <div key={p._id} className="border rounded p-3 space-y-2">
                <Image src={isCloudinaryUrl(p.image) ? sanitizeImageUrl(p.image) : "/file.svg"} alt={p.name} width={160} height={120} className="rounded" />
                <div className="font-medium">{p.name}</div>
                <div className="text-sm">₹{p.price}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => startEditProduct(p as any)}>Edit</button>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Edit Product Modal (simple inline form) */}
      {editingProductId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded p-4 w-full max-w-lg space-y-3">
            <h3 className="text-lg font-medium">Edit Product</h3>
            <label className="block">
              <span>Description</span>
              <textarea className="w-full border rounded p-2" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </label>
            <label className="block">
              <span>Details</span>
              <textarea className="w-full border rounded p-2" value={editDetails} onChange={e => setEditDetails(e.target.value)} />
            </label>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={cancelEditProduct}>Cancel</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={saveEditProduct}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


"use client"

import { useSession } from "next-auth/react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { categories as categoryList } from "@/data/mockData"
import FallbackImage from "@/components/common/Image/FallbackImage"
import dynamic from "next/dynamic"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
import { BarChart3, Users, Store, Boxes, Receipt, Package, Truck, CreditCard, Megaphone, LifeBuoy, FileText, Shield, PieChart, Globe } from "lucide-react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

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

type EditableProduct = Product & { description?: string; details?: string }
export default function AdminPageClient() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [approvedSellers, setApprovedSellers] = useState<Seller[]>([])
  const [products, setProducts] = useState<EditableProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [, setSelectedSeller] = useState<Seller | null>(null)
  const [, setSellerProducts] = useState<Product[]>([])
  const [selectedSellerDetails, setSelectedSellerDetails] = useState<Seller | null>(null)
 
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState<string>("")
  const [editDetails, setEditDetails] = useState<string>("")

  const sanitizeImageUrl = (src?: string) => {
    return (src || "").trim().replace(/[)]+$/g, "")
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
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
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
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ status: "approved" }),
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

  const startEditProduct = (p: EditableProduct) => {
    setEditingProductId(p._id)
    setEditDescription(typeof p.description === 'string' ? p.description : '')
    setEditDetails(typeof p.details === 'string' ? p.details : '')
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
        setProducts(prev => prev.map(p => p._id === editingProductId ? { ...p, description: editDescription, details: editDetails } : p))
        cancelEditProduct()
      }
    } catch {}
  }

  const modules = [
    { title: 'Dashboard', icon: BarChart3, route: '/admin' },
    { title: 'Buyer Management', icon: Users, route: '/admin/buyers' },
    { title: 'Seller Management', icon: Store, route: '/admin/sellers' },
    { title: 'Product Management', icon: Boxes, route: '/admin/products' },
    { title: 'Inventory Management', icon: Package, route: '/admin/inventory' },
    { title: 'Order Management', icon: Receipt, route: '/admin/orders' },
    { title: 'Logistics Management', icon: Truck, route: '/admin/logistics' },
    { title: 'Payments & Finance', icon: CreditCard, route: '/admin/finance' },
    { title: 'Marketing & Promotions', icon: Megaphone, route: '/admin/marketing' },
    { title: 'Customer Support', icon: LifeBuoy, route: '/admin/support' },
    { title: 'CMS (Content Management)', icon: FileText, route: '/admin/cms' },
    { title: 'Security & Roles', icon: Shield, route: '/admin/security' },
    { title: 'Reports & Analytics', icon: PieChart, route: '/admin/reports' },
    { title: 'Global Selling (Optional)', icon: Globe, route: '/admin/global-selling' },
  ]

  type CategoryOption = { id: number; label: string }
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<CategoryOption | null>(null)

  if (!allowed) return <AdminLogin />

  return (
    <Suspense fallback={<BeautifulLoader/>}>
    <div className="p-6 space-y-8">
      <div className="rounded-2xl bg-linear-to-r from-brand-purple to-brand-red text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-white/80 mt-1">Control center for operations and analytics</p>
          </div>
          <BarChart3 className="w-8 h-8 opacity-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-white/80">Pending sellers</p>
            <p className="text-2xl font-semibold">{sellers.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-white/80">Approved sellers</p>
            <p className="text-2xl font-semibold">{approvedSellers.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-white/80">Admin products</p>
            <p className="text-2xl font-semibold">{products.length}</p>
          </div>
        </div>
      </div>

      <section id="admin-modules">
        <h2 className="text-xl font-medium">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
          {modules.map((m, i) => {
            const Icon = m.icon
            return (
              <div
                key={i}
                className="border rounded-2xl p-4 bg-white cursor-pointer hover:shadow transition hover:-translate-y-0.5"
                onClick={() => router.push(m.route)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-brand-purple" />
                  <div className="font-semibold">{m.title}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section id="seller-section">
        <h2 className="text-xl font-medium">Pending Sellers</h2>
        {loading ? (
          <BeautifulLoader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sellers.map(s => (
              <div key={s._id} className="border rounded p-3 flex items-center gap-3">
                <FallbackImage src={sanitizeImageUrl(s.businessLogoUrl)} alt={s.businessName} width={48} height={48} className="rounded" />
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

      <section id="product-section">
        <h2 className="text-xl font-medium">Products</h2>
        <div className="flex items-center gap-3 mb-3">
          <CommonDropdown
            options={categoryList.map((c, i) => ({ id: i, label: c.name }))}
            selected={selectedCategoryItem}
            onChange={(v) => {
              if (!Array.isArray(v)) setSelectedCategoryItem(v as CategoryOption)
            }}
            placeholder="Filter by category"
          />
          <button className="px-3 py-1 bg-gray-800 text-white rounded" onClick={() => setSelectedCategoryItem(null)}>Clear</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products
            .filter(p => !selectedCategoryItem || p.category === selectedCategoryItem.label)
            .map((p: EditableProduct) => (
              <div key={p._id} className="border rounded-2xl p-3 space-y-2 bg-white hover:shadow transition">
                <FallbackImage src={sanitizeImageUrl(p.image)} alt={p.name} width={160} height={120} className="rounded" />
                <div className="font-medium">{p.name}</div>
                <div className="text-sm">₹{p.price}</div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => startEditProduct(p)}>Edit</button>
                </div>
              </div>
            ))}
        </div>
      </section>

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
    </Suspense>
  )
}


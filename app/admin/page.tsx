"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import Image from "next/image"

type Seller = {
  _id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  status: string
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

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
      }
    } catch {}
  }

  const createProduct = async (p: Partial<Product>) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      })
      if (res.ok) {
        const d = await res.json()
        setProducts(prev => [d.product, ...prev])
      }
    } catch {}
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
                  image: String(fd.get("image") || ""),
                  category: String(fd.get("category") || ""),
                  price: Number(fd.get("price") || 0),
                }
                const imagesRaw = String(fd.get("images") || "")
                const images = imagesRaw
                  .split(",")
                  .map(s => s.trim())
                  .filter(Boolean)
                if (images.length > 0) (p as any).images = images
                createProduct(p)
                form.reset()
              }}
              className="space-y-3 mb-6"
            >
              <div className="grid md:grid-cols-2 gap-3">
                <input name="name" placeholder="Name" className="px-3 py-2 border rounded" required />
                <input name="image" placeholder="Image URL" className="px-3 py-2 border rounded" required />
                <input name="images" placeholder="Extra images (comma-separated URLs)" className="px-3 py-2 border rounded" />
                <input name="category" placeholder="Category" className="px-3 py-2 border rounded" />
                <input name="price" type="number" step="0.01" placeholder="Price" className="px-3 py-2 border rounded" required />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
            </form>

            <div className="space-y-3">
              {products.map(p => (
                <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={(Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.category} • ₹{p.price}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{p._id}</span>
                </div>
              ))}
              {products.length === 0 && <p className="text-sm text-gray-500">No products</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

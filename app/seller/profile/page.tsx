"use client"

import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { useEffect, useState } from "react"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import { categories as categoryList } from "@/data/mockData"

type Product = {
  _id: string
  name: string
  image: string
  category?: string
  price: number
  stock?: number
  discount?: number
  status?: string
}

type SellerInfo = {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  district?: string
  pincode?: string
  gstNumber?: string
  panNumber?: string
  hasGST?: boolean
  businessLogoUrl?: string
  status?: string
}

export default function SellerProfilePage() {
  const { user } = useAuth()
  const name = user?.name || "Seller"
  const email = user?.email || ""
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; label: string } | null>(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null)
  const [sellerInfoError, setSellerInfoError] = useState<string | null>(null)
  const [savingSeller, setSavingSeller] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!email) return
      try {
        const res = await fetch(`/api/products?limit=50&page=1&createdByEmail=${encodeURIComponent(email)}`)
        const data = await res.json()
        if (res.ok) setMyProducts(data.products || [])
        else setMyProducts([])
      } catch {
        setMyProducts([])
      }
    }
    load()
  }, [email, created])

  useEffect(() => {
    const loadSeller = async () => {
      setSellerInfoError(null)
      if (!email) return
      try {
        const res = await fetch(`/api/seller/me?email=${encodeURIComponent(email)}`)
        const data = await res.json()
        if (!res.ok) {
          setSellerInfo(null)
          setSellerInfoError(data?.error || "Unable to load seller info")
        } else {
          setSellerInfo(data.seller)
        }
      } catch {
        setSellerInfoError("Network error")
      }
    }
    loadSeller()
  }, [email])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-blue-400 p-8 text-white">
            <h1 className="text-3xl font-heading font-bold">Seller Profile</h1>
            <p className="text-blue-100 mt-1">Account details</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                <Image src="/favicon.ico" alt="Logo" width={80} height={80} />
              </div>
              <div>
                <p className="text-xl font-semibold">{name}</p>
                <p className="text-gray-600">{email}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{sellerInfo?.status || "—"}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">Seller</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Registration Details</h2>
          {sellerInfoError && <p className="text-sm text-red-600 mb-2">{sellerInfoError}</p>}
          {sellerInfo ? (
            <form
              onSubmit={async e => {
                e.preventDefault()
                if (!sellerInfo || !email) return
                const approved = String(sellerInfo.status || "").toLowerCase() === "approved"
                if (approved) return
                setSavingSeller(true)
                const fd = new FormData(e.currentTarget as HTMLFormElement)
                const payload: Partial<SellerInfo> & { email: string } = {
                  email,
                  businessName: String(fd.get("businessName") || sellerInfo.businessName || ""),
                  ownerName: String(fd.get("ownerName") || sellerInfo.ownerName || ""),
                  phone: String(fd.get("phone") || sellerInfo.phone || ""),
                  address: String(fd.get("address") || sellerInfo.address || ""),
                  city: String(fd.get("city") || sellerInfo.city || ""),
                  state: String(fd.get("state") || sellerInfo.state || ""),
                  pincode: String(fd.get("pincode") || sellerInfo.pincode || ""),
                  gstNumber: String(fd.get("gstNumber") || sellerInfo.gstNumber || ""),
                  panNumber: String(fd.get("panNumber") || sellerInfo.panNumber || ""),
                }
                try {
                  const res = await fetch("/api/seller/me", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  })
                  const data = await res.json()
                  if (res.ok) setSellerInfo(data.seller || sellerInfo)
                } catch {}
                setSavingSeller(false)
              }}
              className="grid md:grid-cols-2 gap-4"
            >
              <div className="border rounded-lg p-4">
                <label className="block text-sm text-gray-500 mb-1">Business Name</label>
                <input
                  name="businessName"
                  defaultValue={sellerInfo.businessName}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm text-gray-500 mb-1">Owner Name</label>
                <input
                  name="ownerName"
                  defaultValue={sellerInfo.ownerName}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input
                  name="phone"
                  defaultValue={sellerInfo.phone}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm text-gray-500 mb-1">GST Number</label>
                <input
                  name="gstNumber"
                  defaultValue={sellerInfo.gstNumber || ""}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm text-gray-500 mb-1">PAN Number</label>
                <input
                  name="panNumber"
                  defaultValue={sellerInfo.panNumber || ""}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white"
                />
              </div>
              <div className="border rounded-lg p-4 md:col-span-2">
                <label className="block text-sm text-gray-500 mb-1">Address</label>
                <input
                  name="address"
                  defaultValue={sellerInfo.address || ""}
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved"}
                  className="w-full px-3 py-2 border rounded bg-white mb-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input name="city" defaultValue={sellerInfo.city || ""} disabled={String(sellerInfo.status || "").toLowerCase() === "approved"} className="px-3 py-2 border rounded bg-white" placeholder="City" />
                  <input name="state" defaultValue={sellerInfo.state || ""} disabled={String(sellerInfo.status || "").toLowerCase() === "approved"} className="px-3 py-2 border rounded bg-white" placeholder="State" />
                  <input name="pincode" defaultValue={sellerInfo.pincode || ""} disabled={String(sellerInfo.status || "").toLowerCase() === "approved"} className="px-3 py-2 border rounded bg-white" placeholder="Pincode" />
                </div>
              </div>
              <div className="md:col-span-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={String(sellerInfo.status || "").toLowerCase() === "approved" || savingSeller}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {savingSeller ? "Saving..." : "Save Changes"}
                </button>
              </div>
              {String(sellerInfo.status || "").toLowerCase() === "approved" && (
                <p className="text-sm text-gray-600 md:col-span-2">Verified seller details cannot be edited.</p>
              )}
            </form>
          ) : (
            <p className="text-sm text-gray-500">No registration details found.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Add Product</h2>
          <form
            onSubmit={async e => {
              e.preventDefault()
              setCreating(true)
              setError(null)
              setCreated(null)
              const formEl = e.target as HTMLFormElement
              const fd = new FormData(formEl)
              const name = String(fd.get("name") || "")
              const category = selectedCategory ? String(selectedCategory.label) : ""
              const price = Number(fd.get("price") || 0)
              const sellerEmail = email || String(fd.get("sellerEmail") || "")
              const files = (fd.getAll("images") || []).filter(Boolean) as File[]
              const base64: string[] = []
              for (const file of files) {
                const data = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(file) })
                base64.push(data)
              }
              let uploaded: string[] = []
              try {
                if (base64.length) {
                  const up = await fetch("/api/upload/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: base64 }) })
                  const upJson = await up.json()
                  if (up.ok && Array.isArray(upJson.urls)) uploaded = upJson.urls
                }
                const payload = { name, category, price, sellerEmail, images: uploaded }
                const res = await fetch("/api/seller/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                const data = await res.json()
                if (!res.ok) setError(data?.error || "Failed to create product")
                else { setCreated(data.product); formEl.reset(); setSelectedCategory(null) }
              } catch (err) { setError("Network error") }
              setCreating(false)
            }}
            className="space-y-3"
          >
            {!email && (
              <input name="sellerEmail" placeholder="Your email" className="px-3 py-2 border rounded" required />
            )}
            <div className="grid md:grid-cols-2 gap-3">
              <input name="name" placeholder="Name" className="px-3 py-2 border rounded" required />
              <CommonDropdown
                label="Category"
                placeholder="Select category"
                options={categoryList.map(c => ({ id: c.id, label: c.name }))}
                selected={selectedCategory}
                onChange={(sel) => setSelectedCategory(sel as { id: number; label: string } | null)}
                className="w-full"
              />
              <input name="price" type="number" step="0.01" placeholder="Price" className="px-3 py-2 border rounded" required />
              <div className="md:col-span-2">
                <label className="text-sm mb-1 font-medium text-gray-600">Images</label>
                <input name="images" type="file" multiple accept="image/*" className="px-3 py-2 border rounded" />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </button>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            {created && (
              <p className="text-sm text-green-700 mt-2">Product created: {created.name} (₹{created.price})</p>
            )}
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">My Products</h2>
          {!email && (
            <p className="text-sm text-gray-600 mb-2">Login to see your products, or enter email above.</p>
          )}
          <div className="space-y-3">
            {myProducts.map(p => (
              <div key={p._id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                    <Image src={p.image} alt={p.name} width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <div className="text-sm text-gray-600">
                      {p.category} • ₹
                      <input
                        type="number"
                        defaultValue={p.price}
                        className="w-24 px-2 py-1 border rounded text-sm ml-1"
                        onBlur={async (e) => {
                          const val = Number(e.currentTarget.value)
                          if (!Number.isFinite(val) || val < 0) return
                          try {
                            await fetch(`/api/seller/products`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: p._id, price: val, sellerEmail: email }),
                            })
                          } catch {}
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Stock:</span>
                      <input
                        type="number"
                        defaultValue={p.stock ?? 0}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        onBlur={async (e) => {
                          const val = Number(e.currentTarget.value)
                          if (!Number.isFinite(val) || val < 0) return
                          try {
                            await fetch(`/api/seller/products`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: p._id, stock: val, sellerEmail: email }),
                            })
                          } catch {}
                        }}
                      />
                      <span className="text-xs text-gray-500 ml-3">Discount %:</span>
                      <input
                        type="number"
                        defaultValue={p.discount ?? 0}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        onBlur={async (e) => {
                          const val = Number(e.currentTarget.value)
                          if (!Number.isFinite(val) || val < 0) return
                          try {
                            await fetch(`/api/seller/products`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: p._id, discount: val, sellerEmail: email }),
                            })
                          } catch {}
                        }}
                      />
                      <select
                        defaultValue={p.status || "active"}
                        className="ml-3 px-2 py-1 border rounded text-sm"
                        onChange={async (e) => {
                          const val = e.currentTarget.value
                          try {
                            await fetch(`/api/seller/products`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: p._id, status: val, sellerEmail: email }),
                            })
                          } catch {}
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{p._id}</span>
              </div>
            ))}
            {myProducts.length === 0 && <p className="text-sm text-gray-500">No products yet</p>}
          </div>
        <div className="mt-4">
          <a href="/seller/inventory" className="text-blue-600 hover:underline">Go to Inventory Management</a>
        </div>
      </div>

      </div>
    </div>
  )
}

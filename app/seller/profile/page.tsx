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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Business Name</p>
                <p className="font-medium">{sellerInfo.businessName}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Owner Name</p>
                <p className="font-medium">{sellerInfo.ownerName}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{sellerInfo.phone}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">GST Number</p>
                <p className="font-medium">{sellerInfo.gstNumber || "—"}</p>
              </div>
              <div className="border rounded-lg p-4 md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{[sellerInfo.address, sellerInfo.city, sellerInfo.state, sellerInfo.pincode].filter(Boolean).join(", ") || "—"}</p>
              </div>
            </div>
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
              const form = e.target as HTMLFormElement
              const fd = new FormData(form)
              const payload: any = {
                name: String(fd.get("name") || ""),
                image: String(fd.get("image") || ""),
                category: selectedCategory ? String(selectedCategory.label) : "",
                price: Number(fd.get("price") || 0),
                sellerEmail: email || String(fd.get("sellerEmail") || ""),
              }
              const imagesRaw = String(fd.get("images") || "")
              const images = imagesRaw.split(",").map(s => s.trim()).filter(Boolean)
              if (images.length > 0) payload.images = images
              try {
                const res = await fetch("/api/seller/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                })
                const data = await res.json()
                if (!res.ok) {
                  setError(data?.error || "Failed to create product")
                } else {
                  setCreated(data.product)
                  form.reset()
                  setSelectedCategory(null)
                }
              } catch (err) {
                setError("Network error")
              }
              setCreating(false)
            }}
            className="space-y-3"
          >
            {!email && (
              <input name="sellerEmail" placeholder="Your email" className="px-3 py-2 border rounded" required />
            )}
            <div className="grid md:grid-cols-2 gap-3">
              <input name="name" placeholder="Name" className="px-3 py-2 border rounded" required />
              <input name="image" placeholder="Image URL" className="px-3 py-2 border rounded" required />
              <input name="images" placeholder="Extra images (comma-separated URLs)" className="px-3 py-2 border rounded" />
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
                    <p className="text-sm text-gray-600">{p.category} • ₹{p.price}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{p._id}</span>
              </div>
            ))}
            {myProducts.length === 0 && <p className="text-sm text-gray-500">No products yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

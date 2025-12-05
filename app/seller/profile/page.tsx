"use client"

import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { useState } from "react"

type Product = {
  _id: string
  name: string
  image: string
  category?: string
  price: number
}

export default function SellerProfilePage() {
  const { user } = useAuth()
  const name = user?.name || "Seller"
  const email = user?.email || ""
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

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
                <p className="font-medium">Active</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">Seller</p>
              </div>
            </div>
          </div>
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
                category: String(fd.get("category") || ""),
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
              <input name="category" placeholder="Category" className="px-3 py-2 border rounded" />
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
      </div>
    </div>
  )
}

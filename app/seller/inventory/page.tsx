"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import dynamic from "next/dynamic"
import CommonTable from "@/components/common/Table/CommonTable"
import FallbackImage from "@/components/common/Image/FallbackImage"
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))

type Row = { _id: string; name: string; category?: string; stock: number; price?: number; image?: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [bulkText, setBulkText] = useState("")
  const [minStock, setMinStock] = useState<string>("")
  const [maxStock, setMaxStock] = useState<string>("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const load = async () => {
    if (!email) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sellerEmail", email)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/seller/products?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        const items: Row[] = data.products || []
        const min = minStock ? Number(minStock) : undefined
        const max = maxStock ? Number(maxStock) : undefined
        const filtered = items.filter(r => {
          const s = Number(r.stock || 0)
          if (min !== undefined && s < min) return false
          if (max !== undefined && s > max) return false
          return true
        })
        setRows(filtered)
        setTotal(Number(data.total || 0))
      } else {
        setRows([])
        setTotal(0)
      }
    } catch { setRows([]); setTotal(0) }
    setLoading(false)
  }

  useEffect(() => { load() }, [email, page, search, minStock, maxStock, sortKey, sortOrder])

  const updateStock = async (id: string, stock: number) => {
    try { await fetch(`/api/seller/products`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, stock, sellerEmail: email }) }); load() } catch {}
  }

  const bulkUpdate = async () => {
    const lines = bulkText.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    const updates: { id: string; stock: number }[] = []
    for (const line of lines) {
      const parts = line.split(",").map(s => s.trim())
      if (parts.length >= 2) {
        const id = parts[0]
        const stock = Number(parts[1])
        if (id && Number.isFinite(stock)) updates.push({ id, stock })
      }
    }
    for (const u of updates) { await updateStock(u.id, u.stock) }
    setBulkText("")
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage inventory.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Inventory Management</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-sm mb-1 font-medium text-gray-600">Min Stock</label>
            <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm mb-1 font-medium text-gray-600">Max Stock</label>
            <input type="number" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search inventory" />
          </div>
        </div>
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable<Row>
            columns={[
              { key: "image", label: "Image", render: (r) => (
                <div className="relative w-12 h-10">
                  <FallbackImage src={typeof r.image === "string" ? r.image : ""} alt={r.name} width={48} height={40} className="object-cover rounded border" />
                </div>
              ) },
              { key: "name", label: "Product", sortable: true },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", sortable: true, render: (r) => `₹${Number(r.price || 0).toFixed(2)}` },
              { key: "stock", label: "Stock", sortable: true, render: (r) => (
                <input type="number" defaultValue={r.stock} className="w-24 px-2 py-1 border rounded" onBlur={(e) => updateStock(r._id, Number(e.currentTarget.value))} />
              ) },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={rows}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r._id}
          />
        )}
        <div className="flex items-center justify-between">
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Bulk Stock Upload</h2>
        <p className="text-sm text-gray-600">Enter lines in format: productId,stock</p>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded"></textarea>
        <button onClick={bulkUpdate} className="px-4 py-2 rounded bg-blue-600 text-white">Update</button>
      </div>
    </div>
    )}
    </Suspense>
  )
}

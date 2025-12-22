"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"
import CommonPagination from "@/components/common/Pagination/CommonPagination"
import SearchBox from "@/components/common/SearchBox/SearchBox"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import { categories as categoryList } from "@/data/mockData"
import Image from "next/image"

type DropdownItem = { id: string | number; label: string }

type ProductRow = { _id: string; name: string; category?: string; price: number; discount?: number; stock?: number; status?: string; image: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<ProductRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({ name: "", category: "", price: "", images: [] as string[] })
  const [uploading, setUploading] = useState(false)
  const categoryOptions = categoryList.map((c) => ({ id: c.name, label: c.name }))

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    const arr: string[] = []
    for (const file of Array.from(files)) {
      const data = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(file)
      })
      arr.push(data)
    }
    setForm((f) => ({ ...f, images: arr }))
  }

  const load = async () => {
    if (!email) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sellerEmail", email)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (search) params.set("search", search)
      const res = await fetch(`/api/seller/products?${params.toString()}`)
      const data = await res.json()
      if (res.ok) { setRows(data.products || []); setTotal(Number(data.total || 0)) } else { setRows([]); setTotal(0) }
    } catch { setRows([]); setTotal(0) }
    setLoading(false)
  }

  useEffect(() => {
    if (!email) return
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("sellerEmail", email)
        params.set("page", String(page))
        params.set("limit", String(pageSize))
        if (search) params.set("search", search)
        const res = await fetch(`/api/seller/products?${params.toString()}`)
        const data = await res.json()
        if (cancelled) return
        if (res.ok) { setRows(data.products || []); setTotal(Number(data.total || 0)) } else { setRows([]); setTotal(0) }
      } catch { if (!cancelled) { setRows([]); setTotal(0) } }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [email, page, search])

  const createProduct = async () => {
    setUploading(true)
    try {
      let uploaded: string[] = []
      if (form.images.length) {
        const up = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: form.images }) })
        const upJson = await up.json()
        if (up.ok && Array.isArray(upJson.urls)) uploaded = upJson.urls
      }
      const payload = { name: form.name, category: form.category, price: Number(form.price), images: uploaded, sellerEmail: email }
      const res = await fetch(`/api/seller/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) { setForm({ name: "", category: "", price: "", images: [] }); setPage(1); load() }
    } catch {}
    setUploading(false)
  }

  const updateField = async (id: string, changes: Partial<{ price: number; discount: number; stock: number; status: string }>) => {
    try {
      await fetch(`/api/seller/products`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, sellerEmail: email, ...changes }) })
      setRows(prev => prev.map(r => r._id === id ? { ...r, ...changes } : r))
    } catch {}
  }
  const deleteProduct = async (id: string) => {
    try { await fetch(`/api/seller/products?id=${encodeURIComponent(id)}&sellerEmail=${encodeURIComponent(email)}`, { method: "DELETE" }); load() } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage products.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Product Management</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border rounded" />
          <CommonDropdown
            options={categoryOptions}
            selected={form.category ? { id: form.category, label: form.category } : null}
            onChange={(item) => setForm({ ...form, category: (item as DropdownItem).label })}
            placeholder="Category"
          />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 border rounded" />
          <div className="md:col-span-3">
            <input type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} />
            <div className="mt-2 flex flex-wrap gap-2">
              {form.images.map((src, i) => (
                <Image key={i} src={src} alt="preview" width={64} height={64} className="object-cover rounded border" unoptimized />
              ))}
            </div>
          </div>
        </div>
        <button onClick={createProduct} className="px-4 py-2 rounded bg-blue-600 text-white" disabled={uploading}>{uploading ? "Uploading…" : "Add Product"}</button>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
          <span className="text-sm text-gray-600">Total: {total}</span>
        </div>
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable
            columns={[ 
              { key: "image", label: "Image", render: (r) => (
                <Image src={r.image} alt={r.name} width={48} height={48} className="object-cover rounded border" unoptimized />
              ) },
              { key: "name", label: "Name", sortable: true },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", sortable: true, render: (r) => (
                <input type="number" defaultValue={r.price} className="w-24 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { price: Number(e.currentTarget.value) })} />
              ) },
              { key: "discount", label: "Discount", render: (r) => (
                <input type="number" defaultValue={r.discount || 0} className="w-20 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { discount: Number(e.currentTarget.value) })} />
              ) },
              { key: "stock", label: "Stock", sortable: true, render: (r) => (
                <input type="number" defaultValue={r.stock || 0} className="w-20 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { stock: Number(e.currentTarget.value) })} />
              ) },
              { key: "status", label: "Status", render: (r) => (
                <select defaultValue={r.status || "approved"} className="border rounded px-2 py-1" onChange={(e) => updateField(r._id, { status: e.currentTarget.value })}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              ) },
              { key: "_id", label: "Actions", render: (r) => (
                <button onClick={() => deleteProduct(r._id)} className="px-2 py-1 rounded border">Delete</button>
              ) },
            ]}
            data={rows}
            sortKey={"createdAt"}
            sortOrder="desc"
            rowKey={(r) => r._id}
          />
        )}
        <div className="flex items-center justify-between">
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
    )}
    </Suspense>
  )
}

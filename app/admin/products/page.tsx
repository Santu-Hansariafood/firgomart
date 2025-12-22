"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import CommonTable from "@/components/common/Table/CommonTable"
import CommonPagination from "@/components/common/Pagination/CommonPagination"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import SearchBox from "@/components/common/SearchBox/SearchBox"
import locationData from "@/data/country.json"
import BackButton from "@/components/common/BackButton/BackButton"
import { categories as categoryList } from "@/data/mockData"

type ProductItem = {
  id: string
  name: string
  category?: string
  price: number
  stock?: number
  sellerState?: string
  sellerHasGST?: boolean
  createdByEmail?: string
  createdAt?: string
}

type DropdownItem = { id: string | number; label: string }

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || (authUser as any)?.role === "admin"
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [products, setProducts] = useState<ProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100

  const india = locationData.countries.find((c: any) => c.country === "India")
  const stateOptions: DropdownItem[] = (india?.states || []).map((s: any) => ({ id: s.state, label: s.state }))
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null)
  const categoryOptions: DropdownItem[] = categoryList.map((c) => ({ id: c.name, label: c.name }))

  const gstOptions: DropdownItem[] = [
    { id: "", label: "GST: Any" },
    { id: "true", label: "GST: Yes" },
    { id: "false", label: "GST: No" },
  ]
  const [selectedGST, setSelectedGST] = useState<DropdownItem>(gstOptions[0])

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [category, setCategory] = useState<string>("")

  const loadProducts = async () => {
    setLoading(true)
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (category) params.set("category", category)
      if (selectedState?.id && String(selectedGST.id) !== "true") params.set("state", String(selectedState.id))
      if (selectedGST?.id !== undefined && selectedGST.id !== "") params.set("hasGST", String(selectedGST.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: {
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
      })
      const data = await res.json()
      if (res.ok) {
        setProducts(Array.isArray(data.products) ? data.products : [])
        setTotal(Number(data.total || 0))
      } else {
        setProducts([])
        setTotal(0)
      }
    } catch {
      setProducts([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, page, selectedState, selectedGST, search, sortKey, sortOrder, category])

  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formSellerState, setFormSellerState] = useState("")
  const [formGST, setFormGST] = useState(false)
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    if (formGST) setFormSellerState("")
  }, [formGST])

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
    setImages(arr)
  }

  const submitNewProduct = async () => {
    let uploaded: string[] = []
    if (images.length) {
      try {
        const up = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images }) })
        const upJson = await up.json()
        if (up.ok && Array.isArray(upJson.urls)) uploaded = upJson.urls
      } catch {}
    }
    const adminEmail = (session?.user?.email || authUser?.email || "").trim()
    const payload = {
      name: formName.trim(),
      category: formCategory.trim(),
      price: Number(formPrice),
      stock: Number(formStock || 0),
      sellerState: formGST ? "" : formSellerState.trim(),
      sellerHasGST: formGST,
      images: uploaded,
      image: uploaded[0] || "/file.svg",
    }
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setFormName("")
        setFormCategory("")
        setFormPrice("")
        setFormStock("")
        setFormSellerState("")
        setFormGST(false)
        setImages([])
        setPage(1)
        loadProducts()
      }
    } catch {}
  }

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Product Management</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-sm mb-1 font-medium text-gray-600">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {String(selectedGST.id) !== "true" && (
            <div>
              <CommonDropdown
                label="State"
                options={stateOptions}
                selected={selectedState as any}
                onChange={setSelectedState as any}
                placeholder="Seller state"
              />
            </div>
          )}
          <div>
            <CommonDropdown
              label="GST"
              options={gstOptions}
              selected={selectedGST as any}
              onChange={setSelectedGST as any}
              placeholder="GST"
            />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="px-4 py-6 text-gray-700">Loading…</div>
        ) : (
          <CommonTable<ProductItem>
            columns={[
              { key: "image", label: "Image", render: (r) => (
                <img src={(r as any).image} alt={r.name} className="w-12 h-12 object-cover rounded border" />
              ) },
              { key: "name", label: "Name", sortable: true },
              { key: "category", label: "Category", sortable: true },
              { key: "price", label: "Price", sortable: true, render: (r) => `₹${r.price}` },
              { key: "stock", label: "Stock", sortable: true },
              { key: "sellerState", label: "State", sortable: true },
              { key: "sellerHasGST", label: "GST", render: (r) => r.sellerHasGST ? "Yes" : "No" },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={products}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r.id}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <CommonPagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-medium">Add Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm mb-1 font-medium text-gray-600">Name</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm mb-1 font-medium text-gray-600">Category</label>
              <CommonDropdown
                options={categoryOptions}
                selected={formCategory ? { id: formCategory, label: formCategory } : null}
                onChange={(item) => setFormCategory((item as DropdownItem).label)}
                placeholder="Category"
              />
            </div>
            <div>
              <label className="text-sm mb-1 font-medium text-gray-600">Price</label>
              <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm mb-1 font-medium text-gray-600">Stock</label>
              <input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          {!formGST && (
            <div>
              <label className="text-sm mb-1 font-medium text-gray-600">Seller State</label>
              <CommonDropdown
                options={stateOptions}
                selected={formSellerState ? { id: formSellerState, label: formSellerState } : null}
                onChange={(item) => setFormSellerState((item as DropdownItem).label)}
                placeholder="Seller state"
              />
            </div>
          )}
            <div className="flex items-center gap-2">
              <input id="gst" type="checkbox" checked={formGST} onChange={(e) => setFormGST(e.target.checked)} />
              <label htmlFor="gst" className="text-sm font-medium text-gray-600">Seller GST</label>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm mb-1 font-medium text-gray-600">Images</label>
              <input type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} />
              <div className="mt-2 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="preview" className="w-16 h-16 object-cover rounded border" />
                ))}
              </div>
            </div>
          </div>
          <div>
            <button onClick={submitNewProduct} className="px-4 py-2 rounded bg-blue-600 text-white">Create Product</button>
          </div>
        </div>
      </div>
    </div>
    )}
    </Suspense>
  )
}

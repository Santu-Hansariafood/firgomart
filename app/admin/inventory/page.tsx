"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import FallbackImage from "@/components/common/Image/FallbackImage"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type InventoryRow = {
  id: string
  name: string
  category?: string
  stock: number
  price?: number
  image?: string
  sellerState?: string
  sellerHasGST?: boolean
  createdAt?: string
}

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [items, setItems] = useState<InventoryRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [minStock, setMinStock] = useState<string>("")
  const [maxStock, setMaxStock] = useState<string>("")
  const [onlyMine, setOnlyMine] = useState(false)

  const loadInventory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (minStock) params.set("minStock", minStock)
      if (maxStock) params.set("maxStock", maxStock)
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const email = (session?.user?.email || authUser?.email || "").trim()
      if (onlyMine && email) params.set("createdByEmail", email)
      const res = await fetch(`/api/admin/inventory?${params.toString()}`, {
        headers: {
          ...(email ? { "x-admin-email": email } : {}),
        },
      })
      const data = await res.json()
      if (res.ok) {
        setItems(Array.isArray(data.inventory) ? data.inventory : [])
        setTotal(Number(data.total || 0))
      } else {
        setItems([])
        setTotal(0)
      }
    } catch {
      setItems([])
      setTotal(0)
    }
    setLoading(false)
  }

  const updateStock = async (id: string, stock: number) => {
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ stock }),
      })
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, stock } : i))
      }
    } catch {}
  }

  useEffect(() => {
    if (!allowed) return
    loadInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, page, minStock, maxStock, search, sortKey, sortOrder, onlyMine])

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <AdminLogin />
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
          <div className="col-span-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.currentTarget.checked)} />
              Only my products
            </label>
          </div>
          <div className="col-span-1 md:col-span-1">
            <button
              type="button"
              onClick={loadInventory}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable
            columns={[
              { key: "image", label: "Image", render: (r) => (
                <div className="relative w-12 h-10">
                  <FallbackImage
                    src={typeof r.image === "string" ? r.image : ""}
                    alt={r.name}
                    width={48}
                    height={40}
                    className="object-cover rounded border"
                  />
                </div>
              ) },
              { key: "name", label: "Product", sortable: true },
              { key: "category", label: "Category" },
              { key: "price", label: "Price", sortable: true, render: (r) => `₹${Number(r.price || 0).toFixed(2)}` },
              { key: "stock", label: "Stock", sortable: true, render: (r) => (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={r.stock}
                    className="w-24 px-2 py-1 border rounded"
                    onBlur={(e) => {
                      const val = Number(e.currentTarget.value)
                      if (Number.isFinite(val) && val >= 0) updateStock(r.id, val)
                    }}
                  />
                </div>
              ) },
              { key: "sellerState", label: "State" },
              { key: "sellerHasGST", label: "GST", render: (r) => r.sellerHasGST ? "Yes" : "No" },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={items}
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
      </div>
    </div>
    )}
    </Suspense>
  )
}

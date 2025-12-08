"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import CommonTable from "@/components/common/Table/CommonTable"
import CommonPagination from "@/components/common/Pagination/CommonPagination"
import SearchBox from "@/components/common/SearchBox/SearchBox"
import BackButton from "@/components/common/BackButton/BackButton"

type InventoryRow = {
  id: string
  name: string
  category?: string
  stock: number
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
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || (authUser as any)?.role === "admin"
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
      const res = await fetch(`/api/admin/inventory?${params.toString()}`)
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
      const res = await fetch(`/api/admin/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
  }, [allowed, page, minStock, maxStock, search, sortKey, sortOrder])

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
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
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="px-4 py-6 text-gray-700">Loading…</div>
        ) : (
          <CommonTable<InventoryRow>
            columns={[
              { key: "name", label: "Product", sortable: true },
              { key: "category", label: "Category" },
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

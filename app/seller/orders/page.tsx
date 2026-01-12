"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import CommonTable from "@/components/common/Table/CommonTable"
import dynamic from "next/dynamic"
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"

type OrderRow = { id: string; orderNumber: string; buyerEmail?: string; amount: number; status: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<OrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<{ id: string | number; label: string } | null>(null)
  const statusOptions = [
    { id: "", label: "All statuses" },
    { id: "pending", label: "Pending" },
    { id: "packed", label: "Packed" },
    { id: "shipped", label: "Shipped" },
    { id: "completed", label: "Completed" },
    { id: "returned", label: "Returned" },
    { id: "refunded", label: "Refunded" },
    { id: "cancelled", label: "Cancelled" },
  ]

  const load = async () => {
    if (!email) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sellerEmail", email)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (search) params.set("search", search)
      if (fromDate) params.set("from", new Date(fromDate).toISOString())
      if (toDate) params.set("to", new Date(toDate).toISOString())
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/seller/orders?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        let list: OrderRow[] = data.orders || []
        if (statusFilter?.id && String(statusFilter.id) !== "") {
          const s = String(statusFilter.id).toLowerCase()
          list = list.filter(o => String(o.status || "").toLowerCase() === s)
        }
        setRows(list)
        setTotal(Number(data.total || 0))
      } else { setRows([]); setTotal(0) }
    } catch { setRows([]); setTotal(0) }
    setLoading(false)
  }

  useEffect(() => { load() }, [email, page, search, fromDate, toDate, sortKey, sortOrder, statusFilter])

  const updateStatus = async (id: string, status: string) => {
    try { await fetch(`/api/seller/orders`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, sellerEmail: email }) }); load() } catch {}
  }

  const download = async (id: string, type: "invoice" | "label") => {
    try {
      window.open(`/api/seller/orders/${id}/${type}?format=pdf&download=true`, "_blank")
    } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage orders.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Order Management</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search orders" />
          </div>
          <div>
            <label className="text-sm mb-1 font-medium text-gray-600">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="text-sm mb-1 font-medium text-gray-600">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <CommonDropdown
              options={statusOptions}
              selected={statusFilter}
              onChange={(v) => setStatusFilter(v as { id: string | number; label: string })}
              placeholder="Status"
            />
          </div>
          <div className="text-sm text-gray-600">Total: {total}</div>
        </div>
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable<OrderRow>
            columns={[
              { key: "orderNumber", label: "Order", sortable: true },
              { key: "buyerEmail", label: "Buyer" },
              { key: "amount", label: "Amount", sortable: true, render: (r) => `₹${r.amount}` },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
              { key: "status", label: "Status", sortable: true, render: (r) => (
                <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                </select>
              ) },
              { key: "id", label: "Actions", render: (r) => (
                <div className="flex gap-2">
                  <button onClick={() => download(r.id, "invoice")} className="px-2 py-1 rounded border">Invoice</button>
                  <button onClick={() => download(r.id, "label")} className="px-2 py-1 rounded border">Label</button>
                </div>
              ) },
            ]}
            data={rows}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r.id}
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

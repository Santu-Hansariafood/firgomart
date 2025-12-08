"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"
import CommonPagination from "@/components/common/Pagination/CommonPagination"
import SearchBox from "@/components/common/SearchBox/SearchBox"

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

  const load = async () => {
    if (!email) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sellerEmail", email)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (search) params.set("search", search)
      const res = await fetch(`/api/seller/orders?${params.toString()}`)
      const data = await res.json()
      if (res.ok) { setRows(data.orders || []); setTotal(Number(data.total || 0)) } else { setRows([]); setTotal(0) }
    } catch { setRows([]); setTotal(0) }
    setLoading(false)
  }

  useEffect(() => { load() }, [email, page, search])

  const updateStatus = async (id: string, status: string) => {
    try { await fetch(`/api/seller/orders`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, sellerEmail: email }) }); load() } catch {}
  }

  const download = async (id: string, type: "invoice" | "label") => {
    try {
      const res = await fetch(`/api/seller/orders/${id}/${type}`)
      const data = await res.json()
      console.log(type, data)
    } catch {}
  }

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage orders.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Order Management</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SearchBox value={search} onChange={setSearch} placeholder="Search orders" />
          <span className="text-sm text-gray-600">Total: {total}</span>
        </div>
        {loading ? (
          <div className="px-4 py-6 text-gray-700">Loading…</div>
        ) : (
          <CommonTable<OrderRow>
            columns={[
              { key: "orderNumber", label: "Order", sortable: true },
              { key: "buyerEmail", label: "Buyer" },
              { key: "amount", label: "Amount", sortable: true, render: (r) => `₹${r.amount}` },
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
            sortKey={"createdAt"}
            sortOrder="desc"
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


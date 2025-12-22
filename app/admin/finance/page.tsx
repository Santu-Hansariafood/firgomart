"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import Loading from "@/app/loading"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type PaymentRow = {
  id: string
  orderNumber: string
  buyerEmail?: string
  amount: number
  method?: string
  status?: string
  transactionId?: string
  gateway?: string
  settledAt?: string
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

  const [rows, setRows] = useState<PaymentRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "paid", label: "Paid" },
    { id: "failed", label: "Failed" },
    { id: "refunded", label: "Refunded" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])

  const methodOptions: DropdownItem[] = [
    { id: "", label: "All Methods" },
    { id: "card", label: "Card" },
    { id: "upi", label: "UPI" },
    { id: "netbanking", label: "Netbanking" },
    { id: "cod", label: "COD" },
  ]
  const [selectedMethod, setSelectedMethod] = useState<DropdownItem>(methodOptions[0])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (selectedStatus?.id !== undefined) params.set("status", String(selectedStatus.id))
      if (selectedMethod?.id !== undefined) params.set("method", String(selectedMethod.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/finance?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setRows(Array.isArray(data.payments) ? data.payments : [])
        setTotal(Number(data.total || 0))
      } else {
        setRows([])
        setTotal(0)
      }
    } catch {
      setRows([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadPayments()
  }, [allowed, page, selectedStatus, selectedMethod, search, sortKey, sortOrder])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/finance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
  }

  const markSettled = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/finance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settled: true }),
      })
      if (res.ok) setRows(prev => prev.map(r => r.id === id ? { ...r, settledAt: new Date().toISOString() } : r))
    } catch {}
  }

  return (
    <Suspense fallback={<Loading />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Payments & Finance</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <CommonDropdown label="Status" options={statusOptions} selected={selectedStatus as any} onChange={setSelectedStatus as any} placeholder="Status" />
          </div>
          <div>
            <CommonDropdown label="Method" options={methodOptions} selected={selectedMethod as any} onChange={setSelectedMethod as any} placeholder="Method" />
          </div>
          <div className="md:col-span-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search payments" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="px-4 py-6 text-gray-700">Loading…</div>
        ) : (
          <CommonTable<PaymentRow>
            columns={[
              { key: "orderNumber", label: "Order", sortable: true },
              { key: "buyerEmail", label: "Email" },
              { key: "amount", label: "Amount", sortable: true, render: (r) => `₹${r.amount}` },
              { key: "method", label: "Method" },
              { key: "status", label: "Status", sortable: true, render: (r) => (
                <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                  {statusOptions.filter(s => s.id !== "").map(s => (
                    <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                  ))}
                </select>
              ) },
              { key: "transactionId", label: "Txn" },
              { key: "gateway", label: "Gateway" },
              { key: "settledAt", label: "Settled", render: (r) => r.settledAt ? new Date(r.settledAt).toLocaleString() : (
                <button onClick={() => markSettled(r.id)} className="px-2 py-1 rounded border">Mark Settled</button>
              ) },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={rows}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r.id}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
    )}
    </Suspense>
  )
}

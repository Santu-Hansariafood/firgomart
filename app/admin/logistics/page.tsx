"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type ShipmentRow = {
  id: string
  orderNumber: string
  trackingNumber: string
  courier?: string
  status?: string
  origin?: string
  destination?: string
  lastUpdate?: string
  eventsCount?: number
}

type DropdownItem = { id: string | number; label: string }

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [rows, setRows] = useState<ShipmentRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("lastUpdate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "created", label: "Created" },
    { id: "in_transit", label: "In Transit" },
    { id: "delivered", label: "Delivered" },
    { id: "returned", label: "Returned" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])

  const courierOptions: DropdownItem[] = [
    { id: "", label: "All Couriers" },
    { id: "Delhivery", label: "Delhivery" },
    { id: "BlueDart", label: "BlueDart" },
    { id: "DTDC", label: "DTDC" },
  ]
  const [selectedCourier, setSelectedCourier] = useState<DropdownItem>(courierOptions[0])

  useEffect(() => {
    if (!allowed) return
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(pageSize))
        if (selectedStatus?.id !== undefined) params.set("status", String(selectedStatus.id))
        if (selectedCourier?.id !== undefined) params.set("courier", String(selectedCourier.id))
        if (search) params.set("search", search)
        if (sortKey) params.set("sortBy", String(sortKey))
        params.set("sortOrder", sortOrder)
        const res = await fetch(`/api/admin/logistics?${params.toString()}`)
        const data = await res.json()
        if (cancelled) return
        if (res.ok) {
          setRows(Array.isArray(data.shipments) ? data.shipments : [])
          setTotal(Number(data.total || 0))
        } else {
          setRows([])
          setTotal(0)
        }
      } catch {
        if (!cancelled) {
          setRows([])
          setTotal(0)
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [allowed, page, selectedStatus, selectedCourier, search, sortKey, sortOrder])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/logistics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Logistics Management</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <CommonDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatus}
              onChange={(v) => { if (!Array.isArray(v)) setSelectedStatus(v) }}
              placeholder="Status"
            />
          </div>
          <div>
            <CommonDropdown
              label="Courier"
              options={courierOptions}
              selected={selectedCourier}
              onChange={(v) => { if (!Array.isArray(v)) setSelectedCourier(v) }}
              placeholder="Courier"
            />
          </div>
          <div className="md:col-span-3">
            <SearchBox value={search} onChange={setSearch} placeholder="Search by order/tracking" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable
            columns={[
              { key: "orderNumber", label: "Order", sortable: true },
              { key: "trackingNumber", label: "Tracking" },
              { key: "courier", label: "Courier" },
              { key: "status", label: "Status", sortable: true, render: (r) => (
                <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                  {statusOptions.filter(s => s.id !== "").map(s => (
                    <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                  ))}
                </select>
              ) },
              { key: "origin", label: "Origin" },
              { key: "destination", label: "Destination" },
              { key: "eventsCount", label: "Transit", render: (r) => String(r.eventsCount || 0) },
              { key: "lastUpdate", label: "Updated", sortable: true, render: (r) => r.lastUpdate ? new Date(r.lastUpdate).toLocaleString() : "" },
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

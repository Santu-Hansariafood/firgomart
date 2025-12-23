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
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("lastUpdate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [hideDelivered, setHideDelivered] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<{
    orderNumber: string
    buyerEmail?: string
    buyerName?: string
    amount?: number
    status?: string
    address?: string
    city?: string
    state?: string
    country?: string
    createdAt?: string
    items?: Array<{ name?: string; quantity: number; price: number }>
  } | null>(null)

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "picked", label: "Picked" },
    { id: "shipped", label: "Shipped" },
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
        const adminEmail = (session?.user?.email || authUser?.email || "").trim()
        const res = await fetch(`/api/admin/logistics?${params.toString()}`, {
          headers: {
            ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
          },
        })
        const data = await res.json()
        if (cancelled) return
        if (res.ok) {
          setError(null)
          const list: ShipmentRow[] = Array.isArray(data.shipments) ? (data.shipments as ShipmentRow[]) : []
          const filtered = hideDelivered ? list.filter((s: ShipmentRow) => String(s.status).toLowerCase() !== "delivered") : list
          setRows(filtered)
          setTotal(Number(data.total || 0))
        } else {
          setError(typeof data?.error === "string" ? data.error : "Failed to load logistics")
          setRows([])
          setTotal(0)
        }
      } catch {
        if (!cancelled) {
          setError("Network error")
          setRows([])
          setTotal(0)
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [allowed, page, selectedStatus, selectedCourier, search, sortKey, sortOrder, hideDelivered])

  const updateStatus = async (id: string, status: string) => {
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/logistics/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setRows(prev => {
          const next = prev.map(r => r.id === id ? { ...r, status } : r)
          return hideDelivered && String(status).toLowerCase() === "delivered"
            ? next.filter(r => r.id !== id)
            : next
        })
      }
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
          <div className="col-span-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
              <input type="checkbox" checked={hideDelivered} onChange={(e) => setHideDelivered(e.currentTarget.checked)} />
              Hide delivered
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
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
              { key: "actions", label: "Actions", render: (r) => (
                <button
                  className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
                  onClick={async () => {
                    try {
                      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
                      const res = await fetch(`/api/admin/orders/${encodeURIComponent(r.orderNumber)}`, {
                        headers: {
                          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
                        },
                      })
                      const data = await res.json()
                      if (res.ok && data.order) {
                        setSelectedOrder({
                          orderNumber: data.order.orderNumber,
                          buyerEmail: data.order.buyerEmail,
                          buyerName: data.order.buyerName,
                          amount: data.order.amount,
                          status: data.order.status,
                          address: data.order.address,
                          city: data.order.city,
                          state: data.order.state,
                          country: data.order.country,
                          createdAt: data.order.createdAt,
                          items: data.order.items || [],
                        })
                      }
                    } catch {}
                  }}
                >
                  Details
                </button>
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
          <div className="text-sm text-gray-600">Total: {total}</div>
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>

        {selectedOrder && (
          <div className="border rounded-xl bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{selectedOrder.orderNumber}</div>
                <div className="text-sm text-gray-600">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ""}</div>
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="font-medium">{selectedOrder.buyerName}</div>
                <div className="text-sm text-gray-600">{selectedOrder.buyerEmail}</div>
              </div>
              <div className="font-medium">₹{Number(selectedOrder.amount || 0).toFixed(2)}</div>
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <div className="font-medium">{selectedOrder.status}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700">{[selectedOrder.address, selectedOrder.city, selectedOrder.state, selectedOrder.country].filter(Boolean).join(", ")}</div>
            <div className="border-t pt-3">
              <div className="font-semibold mb-2">Items</div>
              <div className="divide-y">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="text-gray-900">{it.name}</div>
                    <div className="text-gray-600">Qty: {it.quantity}</div>
                    <div className="font-medium">₹{Number(it.price || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    )}
    </Suspense>
  )
}

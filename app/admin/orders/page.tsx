"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import { X, Package, CreditCard, MapPin, User, Calendar, Truck, Save, Printer, FileText, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type OrderRow = {
  id: string
  orderNumber: string
  buyerEmail?: string
  buyerName?: string
  amount: number
  status: string
  city?: string
  state?: string
  country?: string
  createdAt?: string
}

type DropdownItem = { id: string | number; label: string }

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser, loading: authLoading } = useAuth()
  const adminEmail = useMemo(() => (session?.user?.email || authUser?.email || "").trim(), [session, authUser])
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [orders, setOrders] = useState<OrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [orderIdQuery, setOrderIdQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<{
    id: string
    orderNumber: string
    buyerEmail?: string
    buyerName?: string
    amount: number
    status: string
    address?: string
    city?: string
    state?: string
    country?: string
    createdAt?: string
    deliveredAt?: string
    completedAt?: string
    completionVerified?: boolean
    items?: Array<{ name?: string; quantity: number; price: number; selectedSize?: string; selectedColor?: string; appliedOffer?: { name: string; value: number | string } }>
    tracking?: Array<{ number: string; url: string }>
    deliveryFee?: number
    payment?: {
      method: string
      status: string
      transactionId: string
      gateway: string
      settledAt?: string
    }
    shipment?: {
      trackingNumber: string
      courier: string
      invoiceUrl?: string
      labelUrl?: string
    }
  } | null>(null)
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [groupByDay, setGroupByDay] = useState(false)

  const [trackingList, setTrackingList] = useState<Array<{ number: string; url: string }>>([])
  const [newTrackNum, setNewTrackNum] = useState("")
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

  if (authLoading) return <BeautifulLoader />

  useEffect(() => {
    if (selectedOrder) {
      if (Array.isArray(selectedOrder.tracking)) {
        setTrackingList(selectedOrder.tracking)
      } else {
        setTrackingList([])
      }
      setEditStatus(selectedOrder.status || "")
    }
  }, [selectedOrder])

  const addTracking = () => {
    if (!newTrackNum) return
    setTrackingList(prev => [...prev, { number: newTrackNum, url: newTrackUrl }])
    setNewTrackNum("")
    setNewTrackUrl("")
  }

  const removeTracking = (idx: number) => {
    setTrackingList(prev => prev.filter((_, i) => i !== idx))
  }

  const saveOrderChanges = async () => {
    if (!selectedOrder) return
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ 
            tracking: trackingList,
            status: editStatus
        }),
      })
      if (res.ok) {
        toast.success("Order updated successfully")
        setSelectedOrder(prev => prev ? { ...prev, status: editStatus, tracking: trackingList } : null)
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: editStatus } : o))
      } else {
        toast.error("Failed to update order")
      }
    } catch {
      toast.error("Error updating order")
    }
  }

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "paid", label: "Paid" },
    { id: "packed", label: "Packed" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
    { id: "refunded", label: "Refunded" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])

  const countryOptions: DropdownItem[] = [
    { id: "ALL", label: "All" },
    { id: "IN", label: "India" },
    { id: "US", label: "United States" },
    { id: "EU", label: "Europe" },
  ]
  const [selectedCountry, setSelectedCountry] = useState<DropdownItem>(countryOptions[0])
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null)

  const onStatusChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedStatus(v)
  }
  const onCountryChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedCountry(v)
  }
  const onStateChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedState(v)
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (selectedStatus?.id !== undefined) params.set("status", String(selectedStatus.id))
      if (selectedCountry?.id && String(selectedCountry.id) !== "ALL") params.set("country", String(selectedCountry.id))
      if (selectedState?.id) params.set("state", String(selectedState.id))
      if (search) params.set("search", search)
      if (buyerEmail) params.set("buyerEmail", buyerEmail)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: {
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
      })
      const data = await res.json()
      if (res.ok) {
        setOrders(Array.isArray(data.orders) ? data.orders : [])
        setTotal(Number(data.total || 0))
      } else {
        setOrders([])
        setTotal(0)
      }
    } catch {
      setOrders([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadOrders()
  }, [allowed, page, selectedStatus, selectedCountry, selectedState, search, sortKey, sortOrder])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingIds(prev => {
        const n = new Set(prev)
        n.add(id)
        return n
    })
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      }
    } catch {}
    setUpdatingIds(prev => {
        const n = new Set(prev)
        n.delete(id)
        return n
    })
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Order Management</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <CommonDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatus}
              onChange={onStatusChange}
              placeholder="Select status"
            />
          </div>
          <div>
            <CommonDropdown
              label="Country"
              options={countryOptions}
              selected={selectedCountry}
              onChange={onCountryChange}
              placeholder="Select country"
            />
          </div>
          <div>
            <CommonDropdown
              label="State"
              options={[]}
              selected={selectedState}
              onChange={onStateChange}
              placeholder="State (optional)"
            />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search orders" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Buyer Email</label>
            <input
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Order ID or Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={orderIdQuery}
                onChange={(e) => setOrderIdQuery(e.target.value)}
                placeholder="ObjectId or ORD-YYYYMMDD-XXXXXX"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                onClick={async () => {
                  const id = orderIdQuery.trim()
                  if (!id) { setSelectedOrder(null); return }
                  try {
                    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
                      headers: {
                        ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
                      },
                    })
                    const data = await res.json()
                    if (res.ok) setSelectedOrder(data.order || null)
                    else setSelectedOrder(null)
                  } catch {
                    setSelectedOrder(null)
                  }
                }}
              >
                Find
              </button>
            </div>
          </div>
          <div className="col-span-1">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
              <input type="checkbox" checked={groupByDay} onChange={(e) => setGroupByDay(e.currentTarget.checked)} />
              Group by day
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <BeautifulLoader />
        ) : (
          <>
            {groupByDay ? (
              <div className="space-y-6">
                {Object.entries(
                  orders.reduce<Record<string, OrderRow[]>>((acc, o) => {
                    const key = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : "Unknown"
                    if (!acc[key]) acc[key] = []
                    acc[key].push(o)
                    return acc
                  }, {})
                ).sort((a, b) => b[0].localeCompare(a[0])).map(([day, list]) => (
                  <div key={day} className="border rounded-xl bg-white">
                    <div className="px-4 py-2 border-b font-semibold">{day}</div>
                    <div className="divide-y">
                      {list.map((r) => (
                        <div key={r.id} className="px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                          <div className="min-w-[180px]">
                            <div className="font-medium">{r.orderNumber}</div>
                            <div className="text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</div>
                          </div>
                          <div className="min-w-[200px]">
                            <div>{r.buyerName}</div>
                            <div className="text-xs text-gray-500">{r.buyerEmail}</div>
                          </div>
                          <div className="min-w-[120px] font-medium">₹{r.amount}</div>
                          <div className="min-w-[160px] relative">
                            <select 
                                defaultValue={r.status} 
                                disabled={updatingIds.has(r.id)}
                                className={`border rounded px-2 py-1 w-full ${updatingIds.has(r.id) ? 'bg-gray-50 text-gray-400' : ''}`}
                                onChange={(e) => updateStatus(r.id, e.currentTarget.value)}
                            >
                              {statusOptions.filter(s => s.id !== "").map(s => (
                                <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                              ))}
                            </select>
                            {updatingIds.has(r.id) && <span className="absolute -top-4 left-0 text-[10px] text-blue-600 font-bold animate-pulse">Saving...</span>}
                          </div>
                          <div className="text-sm text-gray-600">{[r.city, r.state, r.country].filter(Boolean).join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CommonTable
                columns={[
                  { key: "orderNumber", label: "Order #", sortable: true },
                  { key: "buyerName", label: "Buyer" },
                  { key: "buyerEmail", label: "Email" },
                  { key: "amount", label: "Amount", sortable: true, render: (r) => `₹${r.amount}` },
                  { key: "status", label: "Status", sortable: true, render: (r) => (
                    <div className="relative">
                        <select 
                            defaultValue={r.status} 
                            disabled={updatingIds.has(r.id)}
                            className={`border rounded px-2 py-1 ${updatingIds.has(r.id) ? 'bg-gray-50 text-gray-400' : ''}`} 
                            onChange={(e) => updateStatus(r.id, e.currentTarget.value)}
                        >
                          {statusOptions.filter(s => s.id !== "").map(s => (
                            <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                          ))}
                        </select>
                        {updatingIds.has(r.id) && <span className="absolute -top-4 left-0 text-[10px] text-blue-600 font-bold animate-pulse">Saving...</span>}
                    </div>
                  ) },
                  { key: "city", label: "City" },
                  { key: "state", label: "State" },
                  { key: "country", label: "Country" },
                  { key: "createdAt", label: "Placed", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
                  { key: "actions", label: "Actions", render: (r) => (
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/orders/${encodeURIComponent(r.id)}`, {
                              headers: {
                                ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
                              },
                            })
                            const data = await res.json()
                            if (res.ok) setSelectedOrder(data.order || null)
                          } catch {}
                        }}
                      >
                        View
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        onClick={() => window.open(`/print/order/${r.id}`, "_blank")}
                      >
                        Print
                      </button>
                    </div>
                  ) },
                ]}
                data={orders}
                sortKey={sortKey || undefined}
                sortOrder={sortOrder}
                onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
                rowKey={(r) => r.id}
              />
            )}
          </>
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

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="px-6 py-5 border-b flex items-center justify-between bg-linear-to-r from-gray-50 to-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-purple/10 rounded-xl">
                    <Package className="w-6 h-6 text-brand-purple" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {selectedOrder.orderNumber}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        selectedOrder.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        selectedOrder.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {selectedOrder.status.toUpperCase()}
                      </span>
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="px-6 py-3 border-b bg-white flex flex-wrap gap-2 items-center">
                  {selectedOrder.status !== "shipped" && selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && selectedOrder.status !== "refunded" && (
                    <button
                      onClick={async () => {
                         if (!confirm("Generate Shiprocket order?")) return
                         try {
                           const res = await fetch("/api/admin/shiprocket", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ action: "create_order", orderId: selectedOrder.id })
                           })
                           const d = await res.json()
                           if (res.ok) {
                             toast.success(`Shipment created! ${d.shipments?.length} shipments generated.`)
                             const refresh = await fetch(`/api/admin/orders/${selectedOrder.id}`)
                             if (refresh.ok) {
                               const newData = await refresh.json()
                               setSelectedOrder(newData.order)
                             }
                           } else {
                             toast.error(`Failed: ${d.error}`)
                           }
                         } catch (e: any) {
                             toast.error(`Error: ${e.message}`)
                         }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <Truck className="w-4 h-4" />
                      Shiprocket Order
                    </button>
                  )}
                  {selectedOrder.shipment?.labelUrl && (
                    <button
                      onClick={() => window.open(selectedOrder.shipment?.labelUrl, "_blank")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Print Label
                    </button>
                  )}
                  {selectedOrder.shipment?.invoiceUrl && (
                    <button
                      onClick={() => window.open(selectedOrder.shipment?.invoiceUrl, "_blank")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <FileText className="w-4 h-4" />
                      Invoice
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`/print/order/${selectedOrder.id}`, "_blank")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print Slip
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                      <User className="w-5 h-5 text-gray-500" />
                      Customer Details
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Name</div>
                        <div className="font-medium text-gray-900">{selectedOrder.buyerName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</div>
                        <div className="font-medium text-gray-900 truncate" title={selectedOrder.buyerEmail}>{selectedOrder.buyerEmail}</div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      Shipping Address
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="font-medium">{selectedOrder.address}</p>
                      <p className="text-gray-500 mt-1">
                        {[selectedOrder.city, selectedOrder.state, selectedOrder.country].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Payment Card */}
                  {selectedOrder.payment && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        Payment Details
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            selectedOrder.payment.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedOrder.payment.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">Method</span>
                          <span className="font-medium text-gray-900">{selectedOrder.payment.method}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium block mb-1">Transaction ID</span>
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 block truncate font-mono">
                            {selectedOrder.payment.transactionId}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                    <span className="text-sm text-gray-500">{selectedOrder.items?.length || 0} items</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Item Details</th>
                          <th className="px-6 py-3 text-center font-semibold">Qty</th>
                          <th className="px-6 py-3 text-right font-semibold">Price</th>
                          <th className="px-6 py-3 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900 text-base">{item.name || "Unknown Item"}</div>
                                {(item.selectedSize || item.selectedColor) && (
                                  <div className="flex gap-3 text-xs text-gray-500 mt-1.5">
                                    {item.selectedSize && <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">Size: {item.selectedSize}</span>}
                                    {item.selectedColor && <span className="px-2 py-0.5 bg-gray-100 rounded border border-gray-200">Color: {item.selectedColor}</span>}
                                  </div>
                                )}
                                {item.appliedOffer && (
                                  <div className="text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded mt-2 inline-block font-medium">
                                     Offer: {item.appliedOffer.name} ({item.appliedOffer.value}% Off)
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                              <td className="px-6 py-4 text-right text-gray-600">₹{item.price}</td>
                              <td className="px-6 py-4 text-right font-semibold text-gray-900">₹{item.price * item.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No items found in this order</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50/80">
                         <tr>
                           <td colSpan={3} className="px-6 py-3 text-right text-gray-600">Subtotal</td>
                           <td className="px-6 py-3 text-right font-medium">₹{selectedOrder.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0}</td>
                         </tr>
                         <tr>
                           <td colSpan={3} className="px-6 py-3 text-right text-gray-600">Delivery Fee</td>
                           <td className="px-6 py-3 text-right font-medium text-green-600">₹{selectedOrder.deliveryFee || 0}</td>
                         </tr>
                         <tr className="border-t border-gray-200 bg-gray-100/50">
                           <td colSpan={3} className="px-6 py-4 text-right text-gray-900 text-lg font-bold">Total Amount</td>
                           <td className="px-6 py-4 text-right text-lg font-bold text-brand-purple">₹{selectedOrder.amount}</td>
                         </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Status & Tracking */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                     <Truck className="w-5 h-5 text-gray-500" />
                     Order Fulfillment
                   </h3>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">Update Order Status</label>
                          <select 
                              value={editStatus} 
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-all outline-none"
                          >
                              {statusOptions.filter(s => s.id !== "").map(s => (
                                  <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                              ))}
                          </select>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-blue-900 mb-2">Manual Tracking Info</h4>
                          <p className="text-xs text-blue-700 mb-4">Add tracking details if you are shipping manually without Shiprocket.</p>
                          
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newTrackNum}
                              onChange={(e) => setNewTrackNum(e.target.value)}
                              placeholder="Tracking Number"
                              className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newTrackUrl}
                                onChange={(e) => setNewTrackUrl(e.target.value)}
                                placeholder="Tracking URL"
                                className="flex-1 border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <button
                                onClick={addTracking}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">Current Tracking Information</label>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg min-h-[150px] p-1">
                            {trackingList.length > 0 ? (
                              <div className="space-y-1 max-h-[200px] overflow-y-auto p-1">
                                {trackingList.map((t, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 shadow-sm group">
                                     <div className="flex-1 min-w-0">
                                       <div className="font-medium text-sm text-gray-900">{t.number}</div>
                                       {t.url && (
                                         <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate flex items-center gap-1 hover:underline mt-0.5">
                                           {t.url} <ExternalLink className="w-3 h-3" />
                                         </a>
                                       )}
                                     </div>
                                     <button onClick={() => removeTracking(i)} className="ml-2 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                                        <X className="w-4 h-4" />
                                     </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                <Truck className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm">No tracking information available</span>
                              </div>
                            )}
                          </div>
                      </div>
                   </div>
                </div>

              </div>

              <div className="p-5 border-t bg-white flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                 <button
                   onClick={() => setSelectedOrder(null)}
                   className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                 >
                   Close
                 </button>
                 <button
                   onClick={saveOrderChanges}
                   className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black shadow-lg shadow-gray-200 transform active:scale-95 transition-all"
                 >
                   <Save className="w-4 h-4" />
                   Save Changes
                 </button>
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

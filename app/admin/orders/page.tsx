"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import { X } from "lucide-react"

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
  const { user: authUser } = useAuth()
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
    items?: Array<{ name?: string; quantity: number; price: number }>
    tracking?: Array<{ number: string; url: string }>
    deliveryFee?: number
  } | null>(null)
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [groupByDay, setGroupByDay] = useState(false)

  const [trackingList, setTrackingList] = useState<Array<{ number: string; url: string }>>([])
  const [newTrackNum, setNewTrackNum] = useState("")
  const [newTrackUrl, setNewTrackUrl] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            tracking: trackingList,
            status: editStatus
        }),
      })
      if (res.ok) {
        alert("Order updated successfully")
        // Update local state
        setSelectedOrder(prev => prev ? { ...prev, status: editStatus, tracking: trackingList } : null)
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: editStatus } : o))
      } else {
        alert("Failed to update order")
      }
    } catch {
      alert("Error updating order")
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
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        headers: { "Content-Type": "application/json" },
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
                    const res = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`)
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
                    <button
                      className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-50 text-gray-700"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/orders/${encodeURIComponent(r.id)}`)
                          const data = await res.json()
                          if (res.ok) setSelectedOrder(data.order || null)
                        } catch {}
                      }}
                    >
                      View
                    </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedOrder.orderNumber}</h2>
                  <div className="text-sm text-gray-500">
                    Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Unknown"}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Top Section: Customer & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Customer Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{selectedOrder.buyerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium">{selectedOrder.buyerEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Shipping Address</h3>
                    <div className="text-sm text-gray-800 leading-relaxed">
                      {selectedOrder.address}<br/>
                      {[selectedOrder.city, selectedOrder.state, selectedOrder.country].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Order Items</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="px-4 py-2">Item</th>
                          <th className="px-4 py-2 text-center">Qty</th>
                          <th className="px-4 py-2 text-right">Price</th>
                          <th className="px-4 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                          selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="px-4 py-3 font-medium text-gray-900">{item.name || "Unknown Item"}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-600">₹{item.price}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">₹{item.price * item.quantity}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-gray-500">No items found</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                         <tr>
                           <td colSpan={3} className="px-4 py-2 text-right text-gray-600">Subtotal</td>
                           <td className="px-4 py-2 text-right">₹{selectedOrder.items?.reduce((s, i) => s + (i.price * i.quantity), 0) || 0}</td>
                         </tr>
                         <tr>
                           <td colSpan={3} className="px-4 py-2 text-right text-gray-600">Delivery Fee</td>
                           <td className="px-4 py-2 text-right">₹{selectedOrder.deliveryFee || 0}</td>
                         </tr>
                         <tr className="border-t border-gray-200">
                           <td colSpan={3} className="px-4 py-3 text-right text-gray-900 text-base font-bold">Total Amount</td>
                           <td className="px-4 py-3 text-right text-base font-bold text-brand-purple">₹{selectedOrder.amount}</td>
                         </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Tracking & Status Section */}
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl space-y-5">
                   <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <label className="text-sm font-bold text-gray-700 block mb-2">Order Status</label>
                        <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="w-full border border-blue-200 rounded-lg px-3 py-2 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            {statusOptions.filter(s => s.id !== "").map(s => (
                                <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                            ))}
                        </select>
                      </div>
                      
                      {/* Tracking List Display */}
                      <div className="flex-1">
                          <label className="text-sm font-bold text-gray-700 block mb-2">Current Tracking</label>
                          {trackingList.length > 0 ? (
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                              {trackingList.map((t, i) => (
                                <div key={i} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
                                   <div className="flex-1 min-w-0">
                                     <div className="font-medium text-sm truncate">{t.number}</div>
                                     {t.url && <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate block hover:underline">{t.url}</a>}
                                   </div>
                                   <button onClick={() => removeTracking(i)} className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">No tracking info added</div>
                          )}
                      </div>
                   </div>

                   {/* Add Tracking Form */}
                   <div className="pt-4 border-t border-blue-200">
                      <h4 className="text-sm font-bold text-gray-700 mb-3">Add Tracking Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            value={newTrackNum}
                            onChange={(e) => setNewTrackNum(e.target.value)}
                            placeholder="Tracking Number"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            value={newTrackUrl}
                            onChange={(e) => setNewTrackUrl(e.target.value)}
                            placeholder="Tracking URL (https://...)"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-1">
                           <button
                             onClick={addTracking}
                             className="w-full h-full min-h-[38px] bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                           >
                             Add
                           </button>
                        </div>
                      </div>
                   </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                 <button
                   onClick={() => setSelectedOrder(null)}
                   className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={saveOrderChanges}
                   className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-lg transform active:scale-95 transition-all"
                 >
                   Save All Changes
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

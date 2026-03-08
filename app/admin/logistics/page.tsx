"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
import toast from "react-hot-toast"
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
  labelUrl?: string
  invoiceUrl?: string
  manifestUrl?: string
  awbCode?: string
  shiprocketShipmentId?: string
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
  
  const [showPickupModal, setShowPickupModal] = useState(false)
  const [pickupForm, setPickupForm] = useState({
    pickup_location: "Home",
    name: "Deadpool",
    email: "deadpool@chimichanga.com",
    phone: "9777777779",
    address: "Mutant Facility, Sector 3",
    address_2: "",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    pin_code: "110022"
  })

  const [showManualOrderModal, setShowManualOrderModal] = useState(false)
  const [manualDelivery, setManualDelivery] = useState({
    mobile: "",
    fullName: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    altMobile: "",
  })
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true)
  const [manualBilling, setManualBilling] = useState({
    mobile: "",
    fullName: "",
    address: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  })
  const [manualProduct, setManualProduct] = useState({
    name: "",
    unitPrice: "",
    quantity: "1",
    productDiscount: "",
    taxRate: "",
    hsnCode: "",
    category: "",
    sku: "",
  })
  const [manualCharges, setManualCharges] = useState({
    shipping: "",
    giftWrap: "",
    transaction: "",
    totalDiscount: "",
    paymentMethod: "Prepaid",
  })
  const [manualPackage, setManualPackage] = useState({
    deadWeight: "",
    length: "",
    breadth: "",
    height: "",
    volumetricWeight: "",
  })
  const [manualOther, setManualOther] = useState({
    orderTag: "",
    orderId: "",
    notes: "",
    orderDate: "",
  })
  const [creatingManual, setCreatingManual] = useState(false)

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
    { id: "Shiprocket", label: "Shiprocket" },
  ]
  const [selectedCourier, setSelectedCourier] = useState<DropdownItem>(courierOptions[0])

  const performShiprocketAction = async (action: string, params: any) => {
    if (!confirm(`Are you sure you want to ${action.replace("_", " ")}?`)) return
    try {
      const res = await fetch("/api/admin/shiprocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params })
      })
      const d = await res.json()
      if (res.ok) {
        toast.success("Success!")
        // Refresh
        const p = new URLSearchParams()
        p.set("page", String(page))
        p.set("limit", String(pageSize))
        const adminEmail = (session?.user?.email || authUser?.email || "").trim()
        const refreshRes = await fetch(`/api/admin/logistics?${p.toString()}`, {
           headers: { ...(adminEmail ? { "x-admin-email": adminEmail } : {}) }
        })
        const refreshData = await refreshRes.json()
        if (refreshRes.ok && Array.isArray(refreshData.shipments)) {
           setRows(refreshData.shipments)
        }
      } else {
        toast.error(`Failed: ${d.error || d.message}`)
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`)
    }
  }

  const createManualOrder = async () => {
    if (!manualProduct.name || !manualProduct.unitPrice || !manualDelivery.address || !manualDelivery.city || !manualDelivery.pincode || !manualDelivery.state) {
      toast.error("Please fill required fields (delivery + product + price)")
      return
    }
    setCreatingManual(true)
    try {
      const body = {
        action: "create_manual_order",
        delivery: manualDelivery,
        billingSameAsDelivery,
        billing: manualBilling,
        product: manualProduct,
        charges: manualCharges,
        package: manualPackage,
        other: manualOther,
      }
      const res = await fetch("/api/admin/shiprocket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to create order")
      } else {
        toast.success("Shiprocket order created")
        if (data.labelUrl) {
          window.open(data.labelUrl, "_blank")
        }
        setShowManualOrderModal(false)
      }
    } catch (e: any) {
      toast.error(e?.message || "Error creating order")
    }
    setCreatingManual(false)
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Logistics Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualOrderModal(true)}
            className="px-4 py-2 bg-brand-purple text-white text-sm font-medium rounded-lg hover:bg-brand-purple/90 transition-colors"
          >
            Add Order
          </button>
          <button
            onClick={() => setShowPickupModal(true)}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Pickup Location
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/admin/shiprocket", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "test_connection" }),
                })
                const d = await res.json()
                if (res.ok) toast.success(d.message)
                else toast.error(`Connection Failed: ${d.error || d.message}`)
              } catch (e: any) {
                toast.error(`Error: ${e.message}`)
              }
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Test API Connection
          </button>
        </div>
      </div>

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
              { key: "docs", label: "Docs", render: (r) => (
                <div className="flex flex-col gap-1 text-xs">
                   {r.labelUrl && <a href={r.labelUrl} target="_blank" className="text-blue-600 hover:underline">Label</a>}
                   {r.invoiceUrl && <a href={r.invoiceUrl} target="_blank" className="text-blue-600 hover:underline">Invoice</a>}
                   {r.manifestUrl && <a href={r.manifestUrl} target="_blank" className="text-blue-600 hover:underline">Manifest</a>}
                </div>
              )},
              { key: "sr_actions", label: "SR Actions", render: (r) => (
                <div className="flex flex-col gap-1">
                  {r.shiprocketShipmentId && !r.labelUrl && (
                     <button onClick={() => performShiprocketAction("generate_label", { shipmentId: r.shiprocketShipmentId })} className="text-xs text-purple-600 hover:underline">Gen Label</button>
                  )}
                  {r.shiprocketShipmentId && (
                     <button onClick={() => performShiprocketAction("generate_pickup", { shipmentId: r.shiprocketShipmentId })} className="text-xs text-purple-600 hover:underline">Req Pickup</button>
                  )}
                  {r.shiprocketShipmentId && !r.manifestUrl && (
                     <button onClick={() => performShiprocketAction("generate_manifest", { shipmentId: r.shiprocketShipmentId })} className="text-xs text-purple-600 hover:underline">Gen Manifest</button>
                  )}
                  {r.shiprocketShipmentId && (
                     <button onClick={() => performShiprocketAction("track", { awbCode: r.awbCode || r.trackingNumber })} className="text-xs text-purple-600 hover:underline">Track</button>
                  )}
                </div>
              )},
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

        {showPickupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Add Pickup Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(pickupForm).map((k) => (
                    <div key={k}>
                       <label className="block text-sm font-medium capitalize mb-1">{k.replace("_", " ")}</label>
                       <input 
                         type="text" 
                         value={(pickupForm as any)[k]}
                         onChange={(e) => setPickupForm(prev => ({ ...prev, [k]: e.target.value }))}
                         className="w-full border rounded px-3 py-2"
                       />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                   <button 
                     onClick={() => setShowPickupModal(false)}
                     className="px-4 py-2 border border-brand-purple rounded bg-white hover:bg-brand-purple/5 text-brand-purple"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={async () => {
                       try {
                         const res = await fetch("/api/admin/shiprocket", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ action: "add_pickup_location", ...pickupForm })
                         })
                         const d = await res.json()
                         if (res.ok) {
                           toast.success("Pickup location added successfully!")
                           setShowPickupModal(false)
                         } else {
                           toast.error(`Failed: ${d.error || d.message}`)
                         }
                       } catch (e: any) {
                         toast.error(`Error: ${e.message}`)
                       }
                     }}
                     className="px-4 py-2 bg-brand-purple text-white rounded hover:bg-brand-purple/90"
                   >
                     Add Location
                   </button>
                </div>
             </div>
          </div>
        )}

        {showManualOrderModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add Shiprocket Order</h2>
                <button
                  onClick={() => setShowManualOrderModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Delivery Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mobile Number</label>
                      <input
                        value={manualDelivery.mobile}
                        onChange={e => setManualDelivery(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alternate Mobile Number</label>
                      <input
                        value={manualDelivery.altMobile}
                        onChange={e => setManualDelivery(prev => ({ ...prev, altMobile: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      value={manualDelivery.fullName}
                      onChange={e => setManualDelivery(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Flat/House no / Floor / Building</label>
                    <input
                      value={manualDelivery.address}
                      onChange={e => setManualDelivery(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Landmark</label>
                    <input
                      value={manualDelivery.landmark}
                      onChange={e => setManualDelivery(prev => ({ ...prev, landmark: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Pincode</label>
                      <input
                        value={manualDelivery.pincode}
                        onChange={e => setManualDelivery(prev => ({ ...prev, pincode: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        value={manualDelivery.city}
                        onChange={e => setManualDelivery(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        value={manualDelivery.state}
                        onChange={e => setManualDelivery(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Billing Details</h3>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={billingSameAsDelivery}
                        onChange={e => setBillingSameAsDelivery(e.currentTarget.checked)}
                      />
                      Same as Delivery
                    </label>
                  </div>
                  {!billingSameAsDelivery && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Mobile Number</label>
                          <input
                            value={manualBilling.mobile}
                            onChange={e => setManualBilling(prev => ({ ...prev, mobile: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                          value={manualBilling.fullName}
                          onChange={e => setManualBilling(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Flat/House no / Floor / Building</label>
                        <input
                          value={manualBilling.address}
                          onChange={e => setManualBilling(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Landmark</label>
                        <input
                          value={manualBilling.landmark}
                          onChange={e => setManualBilling(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Pincode</label>
                          <input
                            value={manualBilling.pincode}
                            onChange={e => setManualBilling(prev => ({ ...prev, pincode: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">City</label>
                          <input
                            value={manualBilling.city}
                            onChange={e => setManualBilling(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">State</label>
                          <input
                            value={manualBilling.state}
                            onChange={e => setManualBilling(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full border rounded px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Product Details</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <input
                      value={manualProduct.name}
                      onChange={e => setManualProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit Price</label>
                      <input
                        value={manualProduct.unitPrice}
                        onChange={e => setManualProduct(prev => ({ ...prev, unitPrice: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        value={manualProduct.quantity}
                        onChange={e => setManualProduct(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Discount</label>
                      <input
                        value={manualProduct.productDiscount}
                        onChange={e => setManualProduct(prev => ({ ...prev, productDiscount: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tax Rate</label>
                      <input
                        value={manualProduct.taxRate}
                        onChange={e => setManualProduct(prev => ({ ...prev, taxRate: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">HSN Code</label>
                      <input
                        value={manualProduct.hsnCode}
                        onChange={e => setManualProduct(prev => ({ ...prev, hsnCode: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Category</label>
                      <input
                        value={manualProduct.category}
                        onChange={e => setManualProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <input
                      value={manualProduct.sku}
                      onChange={e => setManualProduct(prev => ({ ...prev, sku: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Other Charges & Discount</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Shipping Charges</label>
                      <input
                        value={manualCharges.shipping}
                        onChange={e => setManualCharges(prev => ({ ...prev, shipping: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Gift Wrap</label>
                      <input
                        value={manualCharges.giftWrap}
                        onChange={e => setManualCharges(prev => ({ ...prev, giftWrap: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Transaction Charges</label>
                      <input
                        value={manualCharges.transaction}
                        onChange={e => setManualCharges(prev => ({ ...prev, transaction: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Total Discount</label>
                      <input
                        value={manualCharges.totalDiscount}
                        onChange={e => setManualCharges(prev => ({ ...prev, totalDiscount: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Method</label>
                    <select
                      value={manualCharges.paymentMethod}
                      onChange={e => setManualCharges(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="Prepaid">Prepaid</option>
                      <option value="COD">COD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Package Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Dead Weight (kg)</label>
                      <input
                        value={manualPackage.deadWeight}
                        onChange={e => setManualPackage(prev => ({ ...prev, deadWeight: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Volumetric Weight</label>
                      <input
                        value={manualPackage.volumetricWeight}
                        onChange={e => setManualPackage(prev => ({ ...prev, volumetricWeight: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Length (cm)</label>
                      <input
                        value={manualPackage.length}
                        onChange={e => setManualPackage(prev => ({ ...prev, length: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Breadth (cm)</label>
                      <input
                        value={manualPackage.breadth}
                        onChange={e => setManualPackage(prev => ({ ...prev, breadth: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Height (cm)</label>
                      <input
                        value={manualPackage.height}
                        onChange={e => setManualPackage(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Other Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Order Tag</label>
                      <input
                        value={manualOther.orderTag}
                        onChange={e => setManualOther(prev => ({ ...prev, orderTag: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Order Id</label>
                      <input
                        value={manualOther.orderId}
                        onChange={e => setManualOther(prev => ({ ...prev, orderId: e.target.value }))}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Date</label>
                    <input
                      type="datetime-local"
                      value={manualOther.orderDate}
                      onChange={e => setManualOther(prev => ({ ...prev, orderDate: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={manualOther.notes}
                      onChange={e => setManualOther(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowManualOrderModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  disabled={creatingManual}
                >
                  Cancel
                </button>
                <button
                  onClick={createManualOrder}
                  disabled={creatingManual}
                  className="px-6 py-2 bg-brand-purple text-white rounded-lg text-sm font-medium hover:bg-brand-purple/90 disabled:opacity-60"
                >
                  {creatingManual ? "Creating..." : "Create Order & Label"}
                </button>
              </div>
            </div>
          </div>
        )}

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

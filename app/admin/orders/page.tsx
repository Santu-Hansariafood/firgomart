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
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [groupByDay, setGroupByDay] = useState(false)

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
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
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
                          <div className="min-w-[160px]">
                            <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                              {statusOptions.filter(s => s.id !== "").map(s => (
                                <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                              ))}
                            </select>
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
                    <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                      {statusOptions.filter(s => s.id !== "").map(s => (
                        <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                      ))}
                    </select>
                  ) },
                  { key: "city", label: "City" },
                  { key: "state", label: "State" },
                  { key: "country", label: "Country" },
                  { key: "createdAt", label: "Placed", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
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
      </div>
    </div>
    )}
    </Suspense>
  )
}

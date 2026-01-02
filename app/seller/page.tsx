"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import dynamic from "next/dynamic"
import CommonTable from "@/components/common/Table/CommonTable"
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))  

type OrderRow = { id: string; orderNumber: string; amount: number; status: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email

  const [todaySales, setTodaySales] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [returnCancel, setReturnCancel] = useState(0)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 100

  const load = async () => {
    if (!email) return
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const params = new URLSearchParams()
    params.set("sellerEmail", email)
    params.set("page", String(page))
    params.set("limit", String(pageSize))
    params.set("from", start.toISOString())
    const res = await fetch(`/api/seller/orders?${params.toString()}`)
    const data = await res.json()
    if (res.ok) {
      setOrders(Array.isArray(data.orders) ? data.orders : [])
      setTotalOrders(Number(data.total || 0))
      const pend = (data.orders || []).filter((o: any) => String(o.status).toLowerCase() === "pending").length
      setPendingOrders(pend)
      const rc = (data.orders || []).filter((o: any) => ["returned","refunded","cancelled"].includes(String(o.status).toLowerCase())).length
      setReturnCancel(rc)
      const ts = (data.orders || []).reduce((s: number, o: any) => s + Number(o.amount || 0), 0)
      setTodaySales(ts)
    } else {
      setOrders([])
      setTotalOrders(0)
      setPendingOrders(0)
      setReturnCancel(0)
      setTodaySales(0)
    }
  }

  useEffect(() => { load() }, [email, page])

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <div className="p-6">Login as seller to view dashboard.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Seller Home Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Today's sales</p><p className="text-2xl font-semibold">₹{todaySales.toFixed(2)}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Total orders</p><p className="text-2xl font-semibold">{totalOrders}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Pending orders</p><p className="text-2xl font-semibold">{pendingOrders}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Return/Cancel</p><p className="text-2xl font-semibold">{returnCancel}</p></div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Recent Orders</h2>
        <CommonTable<OrderRow>
          columns={[
            { key: "orderNumber", label: "Order", sortable: true },
            { key: "amount", label: "Amount", sortable: true, render: (r) => `₹${r.amount}` },
            { key: "status", label: "Status", sortable: true },
            { key: "createdAt", label: "Placed", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
          ]}
          data={orders}
          sortKey={"createdAt"}
          sortOrder="desc"
          rowKey={(r) => r.id}
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {totalOrders}</div>
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={totalOrders} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
    )}
    </Suspense>
  )
}

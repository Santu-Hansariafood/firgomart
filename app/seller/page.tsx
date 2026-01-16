"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import dynamic from "next/dynamic"
import CommonTable from "@/components/common/Table/CommonTable"
import Link from "next/link"
import { Receipt, PlusCircle, Package, CreditCard } from "lucide-react"
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
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Seller Home Dashboard</h1>
            <p className="text-indigo-100 text-sm">Your operations overview</p>
          </div>
          <Receipt className="w-8 h-8 opacity-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-indigo-100">Today's sales</p>
            <p className="text-2xl font-semibold">₹{todaySales.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-indigo-100">Total orders</p>
            <p className="text-2xl font-semibold">{totalOrders}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-indigo-100">Pending orders</p>
            <p className="text-2xl font-semibold">{pendingOrders}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3">
            <p className="text-sm text-indigo-100">Return/Cancel</p>
            <p className="text-2xl font-semibold">{returnCancel}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/seller/orders" className="group border rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Order Management</div>
                <div className="text-sm text-gray-600">View and update orders</div>
              </div>
            </div>
          </Link>
          <Link href="/seller/products" className="group border rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Add Product</div>
                <div className="text-sm text-gray-600">Create and manage catalog</div>
              </div>
            </div>
          </Link>
          <Link href="/seller/inventory" className="group border rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-green-600/10 text-green-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Inventory Management</div>
                <div className="text-sm text-gray-600">Track and update stock</div>
              </div>
            </div>
          </Link>
          <Link href="/seller/finance" className="group border rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600/10 text-purple-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Payments</div>
                <div className="text-sm text-gray-600">Transactions and settlements</div>
              </div>
            </div>
          </Link>
        </div>
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

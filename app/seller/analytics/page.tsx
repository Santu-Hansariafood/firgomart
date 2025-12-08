"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"

type Insight = { key: string; value: number }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [salesByProduct, setSalesByProduct] = useState<Insight[]>([])
  const [returnRate, setReturnRate] = useState(0)
  const [ratingOverview, setRatingOverview] = useState(0)

  const load = async () => {
    if (!email) return
    const res = await fetch(`/api/seller/orders?sellerEmail=${encodeURIComponent(email)}&limit=500&page=1`)
    const data = await res.json()
    if (!res.ok) return
    const map: Record<string, number> = {}
    let returns = 0
    for (const o of data.orders || []) {
      if (["returned","refunded","cancelled"].includes(String(o.status).toLowerCase())) returns++
      for (const it of o.items || []) {
        const k = it.name
        map[k] = (map[k] || 0) + Number(it.price || 0) * Number(it.quantity || 1)
      }
    }
    const arr = Object.keys(map).map(k => ({ key: k, value: map[k] }))
    arr.sort((a, b) => b.value - a.value)
    setSalesByProduct(arr)
    const total = Number(data.total || 0)
    setReturnRate(total ? Math.round((returns / total) * 100) : 0)
    setRatingOverview(0)
  }

  useEffect(() => { load() }, [email])

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to view analytics.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Performance Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Return & cancellation rate</p><p className="text-2xl font-semibold">{returnRate}%</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Customer ratings overview</p><p className="text-2xl font-semibold">{ratingOverview}/5</p></div>
      </div>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Top Products by Sales</h2>
        <CommonTable<Insight>
          columns={[{ key: "key", label: "Product" }, { key: "value", label: "Sales", render: (r) => `₹${r.value.toFixed(2)}` }]}
          data={salesByProduct}
          rowKey={(r) => r.key}
        />
      </div>
    </div>
    )}
    </Suspense>
  )
}


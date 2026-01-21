"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"

type TxRow = { _id: string; amount: number; method?: string; status?: string; transactionId?: string; gateway?: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [summary, setSummary] = useState({ earnings: 0, totalOrders: 0, pending: 0, returned: 0 })
  const [tx, setTx] = useState<TxRow[]>([])

  const load = async () => {
    if (!email) return
    const params = new URLSearchParams()
    params.set("sellerEmail", email)
    const res = await fetch(`/api/seller/settlements?${params.toString()}`)
    const data = await res.json()
    if (res.ok) { setSummary(data.summary || { earnings: 0, totalOrders: 0, pending: 0, returned: 0 }); setTx(data.transactions || []) }
    else { setSummary({ earnings: 0, totalOrders: 0, pending: 0, returned: 0 }); setTx([]) }
  }

  useEffect(() => { load() }, [email])

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to view settlements.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Payments & Settlements</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Earnings balance</p><p className="text-2xl font-semibold">₹{summary.earnings.toFixed(2)}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Total orders</p><p className="text-2xl font-semibold">{summary.totalOrders}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Pending orders</p><p className="text-2xl font-semibold">{summary.pending}</p></div>
        <div className="border rounded-xl p-4 bg-white"><p className="text-sm text-gray-600">Returns/Cancel</p><p className="text-2xl font-semibold">{summary.returned}</p></div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Recent Transactions</h2>
        <CommonTable
          columns={[
            { key: "amount", label: "Amount", render: (r) => `₹${r.amount}` },
            { key: "method", label: "Method" },
            { key: "status", label: "Status" },
            { key: "transactionId", label: "Txn" },
            { key: "gateway", label: "Gateway" },
            { key: "createdAt", label: "Created", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
          ]}
          data={tx}
          rowKey={(r) => r._id}
        />
      </div>
    </div>
    )}
    </Suspense>
  )
}


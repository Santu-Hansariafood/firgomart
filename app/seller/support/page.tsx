"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"
import SearchBox from "@/components/common/SearchBox/SearchBox"

type Ticket = { _id: string; orderNumber?: string; subject: string; message: string; status: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<Ticket[]>([])
  const [search, setSearch] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const load = async () => {
    if (!email) return
    const params = new URLSearchParams()
    params.set("sellerEmail", email)
    params.set("limit", "100")
    params.set("page", "1")
    if (search) params.set("search", search)
    const res = await fetch(`/api/seller/support?${params.toString()}`)
    const data = await res.json()
    if (res.ok) setRows(data.tickets || [])
    else setRows([])
  }
  useEffect(() => { load() }, [email, search])

  const raise = async () => {
    if (!subject || !message) return
    await fetch(`/api/seller/support`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerEmail: email, subject, message }) })
    setSubject("")
    setMessage("")
    load()
  }

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to access support.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Support</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Raise Ticket</h2>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 border rounded" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Message" className="px-3 py-2 border rounded"></textarea>
        <button onClick={raise} className="px-4 py-2 rounded bg-blue-600 text-white">Submit</button>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SearchBox value={search} onChange={setSearch} placeholder="Search tickets" />
        </div>
        <CommonTable<Ticket>
          columns={[
            { key: "subject", label: "Subject" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
          ]}
          data={rows}
          rowKey={(r) => r._id}
        />
      </div>
    </div>
    )}
    </Suspense>
  )
}


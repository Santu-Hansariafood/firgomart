"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [form, setForm] = useState<any>({})
  const [status, setStatus] = useState<string>("")

  const load = async () => {
    if (!email) return
    const res = await fetch(`/api/seller/me?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    if (res.ok) { setForm(data.seller || {}); setStatus(data.seller?.status || "") }
  }
  useEffect(() => { load() }, [email])

  const save = async () => {
    const payload = { email, businessName: form.businessName, ownerName: form.ownerName, phone: form.phone, address: form.address, country: form.country, state: form.state, city: form.city, pincode: form.pincode, gstNumber: form.gstNumber, panNumber: form.panNumber, hasGST: form.hasGST }
    await fetch(`/api/seller/me`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    load()
  }

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage account.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Account & KYC</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white border rounded-xl p-4">
        <input value={form.businessName || ""} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="Business Name" className="px-3 py-2 border rounded" />
        <input value={form.ownerName || ""} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner Name" className="px-3 py-2 border rounded" />
        <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 border rounded" />
        <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="px-3 py-2 border rounded" />
        <input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="px-3 py-2 border rounded" />
        <input value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="px-3 py-2 border rounded" />
        <input value={form.pincode || ""} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" className="px-3 py-2 border rounded" />
        <input value={form.gstNumber || ""} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="GST Number" className="px-3 py-2 border rounded" />
        <input value={form.panNumber || ""} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} placeholder="PAN Number" className="px-3 py-2 border rounded" />
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.hasGST} onChange={(e) => setForm({ ...form, hasGST: e.target.checked })} />
          <span>Has GST</span>
        </div>
        <div className="md:col-span-2">
          <button onClick={save} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm text-gray-600">KYC status</p>
        <p className="text-2xl font-semibold">{status || "—"}</p>
      </div>
    </div>
    )}
    </Suspense>
  )
}


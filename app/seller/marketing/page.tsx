"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"
import SearchBox from "@/components/common/SearchBox/SearchBox"

type ProductRow = { _id: string; name: string; discount?: number }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<ProductRow[]>([])
  const [search, setSearch] = useState("")
  const [bannerData, setBannerData] = useState<string>("")

  const load = async () => {
    if (!email) return
    const params = new URLSearchParams()
    params.set("sellerEmail", email)
    params.set("limit", "100")
    params.set("page", "1")
    if (search) params.set("search", search)
    const res = await fetch(`/api/seller/products?${params.toString()}`)
    const data = await res.json()
    if (res.ok) setRows(data.products || [])
    else setRows([])
  }
  useEffect(() => { load() }, [email, search])

  const setDiscount = async (id: string, discount: number) => {
    try { await fetch(`/api/seller/products`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, discount, sellerEmail: email }) }); load() } catch {}
  }

  const uploadBanner = async () => {
    if (!bannerData) return
    try {
      const up = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: [bannerData] }) })
      const upJson = await up.json()
      const url = up.ok && Array.isArray(upJson.urls) ? upJson.urls[0] : ""
      if (url) await fetch(`/api/seller/me`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, businessLogoUrl: url }) })
      setBannerData("")
    } catch {}
  }

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage promotions.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Promotions & Marketing</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
        </div>
        <CommonTable<ProductRow>
          columns={[
            { key: "name", label: "Product" },
            { key: "discount", label: "Discount", render: (r) => (
              <input type="number" defaultValue={r.discount || 0} className="w-24 px-2 py-1 border rounded" onBlur={(e) => setDiscount(r._id, Number(e.currentTarget.value))} />
            ) },
          ]}
          data={rows}
          rowKey={(r) => r._id}
        />
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="text-lg font-medium">Upload Store Banner</h2>
        <input type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          const r = new FileReader()
          r.onload = () => setBannerData(String(r.result))
          r.readAsDataURL(f)
        }} />
        <button onClick={uploadBanner} className="px-4 py-2 rounded bg-blue-600 text-white">Upload</button>
      </div>
    </div>
    )}
    </Suspense>
  )
}


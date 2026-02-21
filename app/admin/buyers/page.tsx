"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import locationData from "@/data/country.json"
import dynamic from "next/dynamic"
import Loading from "@/app/loading"
import { Users } from "lucide-react"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"));
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"));
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"));
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"));
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"));
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"));

type Buyer = {
  id: string
  name?: string
  email: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  dateOfBirth?: string
  gender?: string
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

  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100

  const countryOptions: DropdownItem[] = [
    { id: "ALL", label: "All" },
    { id: "IN", label: "India" },
    { id: "US", label: "United States" },
    { id: "EU", label: "Europe" },
  ]
  const [selectedCountry, setSelectedCountry] = useState<DropdownItem>(countryOptions[0])

  const [stateOptions, setStateOptions] = useState<DropdownItem[]>([])
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null)

  const onCountryChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setSelectedCountry(v) }
  const onStateChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setSelectedState(v) }

  useEffect(() => {
    if (selectedCountry?.id === "IN") {
      type IndiaState = { state: string }
      type Country = { country: string; states?: IndiaState[] }
      const india = (locationData.countries as Country[]).find((c) => c.country === "India")
      const states = (india?.states || []).map((s) => ({ id: s.state, label: s.state }))
      setStateOptions(states)
    } else {
      setStateOptions([])
      setSelectedState(null)
    }
  }, [selectedCountry])

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [editingBuyer, setEditingBuyer] = useState<Buyer | null>(null)
  const [editForm, setEditForm] = useState<Partial<Buyer> | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadBuyers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (selectedCountry?.id && String(selectedCountry.id) !== "ALL") params.set("country", String(selectedCountry.id))
      if (selectedState?.id) params.set("state", String(selectedState.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/buyers?${params.toString()}`, {
        headers: {
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
      })
      const data = await res.json()
      if (res.ok) {
        setBuyers(Array.isArray(data.buyers) ? data.buyers : [])
        setTotal(Number(data.total || 0))
      } else {
        setBuyers([])
        setTotal(0)
      }
    } catch {
      setBuyers([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadBuyers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, page, selectedCountry, selectedState, search, sortKey, sortOrder])

  const adminEmailHeader = (session?.user?.email || authUser?.email || "").trim()

  const openEdit = (buyer: Buyer) => {
    setEditingBuyer(buyer)
    setEditForm({
      id: buyer.id,
      name: buyer.name || "",
      mobile: buyer.mobile || "",
      address: buyer.address || "",
      city: buyer.city || "",
      state: buyer.state || "",
      pincode: buyer.pincode || "",
      country: buyer.country || "",
      dateOfBirth: buyer.dateOfBirth || "",
      gender: buyer.gender || "",
    })
  }

  const handleDelete = async (buyer: Buyer) => {
    if (!buyer.id) return
    if (typeof window !== "undefined") {
      const ok = window.confirm(`Delete buyer ${buyer.email}?`)
      if (!ok) return
    }
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/buyers/${buyer.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmailHeader ? { "x-admin-email": adminEmailHeader } : {}),
        },
      })
      if (res.ok) {
        await loadBuyers()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditChange = (field: keyof Buyer, value: string) => {
    if (!editForm) return
    setEditForm({ ...editForm, [field]: value })
  }

  const handleSaveEdit = async () => {
    if (!editForm || !editingBuyer) return
    const id = editingBuyer.id
    if (!id) return
    setActionLoading(true)
    try {
      const payload = {
        name: (editForm.name || "").trim(),
        mobile: (editForm.mobile || "").trim(),
        address: (editForm.address || "").trim(),
        city: (editForm.city || "").trim(),
        state: (editForm.state || "").trim(),
        pincode: (editForm.pincode || "").trim(),
        country: (editForm.country || "").trim(),
        dateOfBirth: (editForm.dateOfBirth || "").trim(),
        gender: (editForm.gender || "").trim(),
      }
      const res = await fetch(`/api/admin/buyers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmailHeader ? { "x-admin-email": adminEmailHeader } : {}),
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setEditingBuyer(null)
        setEditForm(null)
        await loadBuyers()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const closeEdit = () => {
    setEditingBuyer(null)
    setEditForm(null)
  }

  return (
    <Suspense fallback={<Loading />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Buyer Management</h1>
            <p className="text-indigo-100 text-sm">Filter and manage buyers</p>
          </div>
        </div>
        <span className="text-2xl font-semibold text-white">{total}</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
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
              options={stateOptions}
              selected={selectedState}
              onChange={onStateChange}
              placeholder={selectedCountry?.id === "IN" ? "Select state" : "Not applicable"}
            />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search buyers" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Loading />
        ) : (
          <div className="bg-white rounded-xl shadow-md p-4">
            <CommonTable
              columns={[
                { key: "name", label: "Name", sortable: true },
                { key: "email", label: "Email" },
                { key: "mobile", label: "Mobile" },
                { key: "address", label: "Address", render: (r) => [r.address, r.city, r.state, r.pincode].filter(Boolean).join(", ") },
                { key: "city", label: "City" },
                { key: "state", label: "State", sortable: true },
                { key: "country", label: "Country", sortable: true },
                { key: "createdAt", label: "Registered", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
                { key: "actions", label: "Actions", render: (r) => (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-brand-purple text-white hover:bg-brand-purple/90"
                      onClick={() => openEdit(r as Buyer)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      disabled={actionLoading}
                      onClick={() => handleDelete(r as Buyer)}
                    >
                      Delete
                    </button>
                  </div>
                ) },
              ]}
              data={buyers}
              sortOrder={sortOrder}
              onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
              rowKey={(r, idx) => `${r.id}-${idx}`}
            />
          </div>
        )}
          <div className="text-sm text-gray-600">Total: {total}</div>
          <CommonPagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
        {editingBuyer && editForm && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
              <h2 className="text-lg font-semibold mb-2">Edit Buyer</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Mobile</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.mobile || ""}
                    onChange={(e) => handleEditChange("mobile", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">City</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.city || ""}
                    onChange={(e) => handleEditChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">State</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.state || ""}
                    onChange={(e) => handleEditChange("state", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Pincode</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.pincode || ""}
                    onChange={(e) => handleEditChange("pincode", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Country</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.country || ""}
                    onChange={(e) => handleEditChange("country", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Date of Birth</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.dateOfBirth || ""}
                    onChange={(e) => handleEditChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Gender</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.gender || ""}
                    onChange={(e) => handleEditChange("gender", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Address</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={editForm.address || ""}
                    onChange={(e) => handleEditChange("address", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded border border-gray-300"
                  onClick={closeEdit}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded bg-brand-purple text-white hover:bg-brand-purple/90 disabled:opacity-60"
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    </Suspense>
  )
}

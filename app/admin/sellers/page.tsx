"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import locationData from "@/data/country.json"
import dynamic from "next/dynamic"
import { Store } from "lucide-react"
import Image from "next/image"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type Seller = {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  district?: string
  pincode?: string
  country?: string
  status?: string
  hasGST?: boolean
  gstNumber?: string
  panNumber?: string
  aadhaar?: string
  businessLogoUrl?: string
  createdAt?: string
  reviewNotes?: string
  rejectionReason?: string
  reviewedBy?: string
  reviewedAt?: string
  bankAccount?: string
  bankIfsc?: string
  bankName?: string
  bankBranch?: string
  bankDocumentUrl?: string
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

  const [sellers, setSellers] = useState<Seller[]>([])
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

  const onCountryChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedCountry(v)
  }
  const onStateChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedState(v)
  }

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])
  const onStatusFilterChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) setSelectedStatus(v)
  }

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

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setSellers(prev => prev.map(s => s.id === id ? { ...s, status } as Seller : s))
      }
    } catch {}
  }

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [decisionStatus, setDecisionStatus] = useState<"approved" | "rejected" | "pending">("pending")
  const [decisionNote, setDecisionNote] = useState("")
  const [saving, setSaving] = useState(false)

  const openReview = (seller: Seller) => {
    setSelectedSeller(seller)
    setDecisionStatus((seller.status as any) || "pending")
    setDecisionNote(seller.reviewNotes || seller.rejectionReason || "")
  }

  const saveDecision = async () => {
    if (!selectedSeller) return
    setSaving(true)
    try {
      const payload: Partial<Seller> = {
        status: decisionStatus,
        reviewedAt: new Date().toISOString(),
        reviewNotes: decisionStatus === "approved" ? decisionNote : undefined,
        rejectionReason: decisionStatus === "rejected" ? decisionNote : undefined,
        reviewedBy: (session?.user?.email || authUser?.email || "") || undefined,
      }
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/sellers/${selectedSeller.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        const updated = data.seller as any
        setSellers(prev => prev.map(s => s.id === selectedSeller.id ? {
          ...s,
          status: updated.status,
          reviewNotes: updated.reviewNotes,
          rejectionReason: updated.rejectionReason,
          reviewedAt: updated.reviewedAt,
          reviewedBy: updated.reviewedBy,
        } : s))
        setSelectedSeller({
          ...selectedSeller,
          status: updated.status,
          reviewNotes: updated.reviewNotes,
          rejectionReason: updated.rejectionReason,
          reviewedAt: updated.reviewedAt,
          reviewedBy: updated.reviewedBy,
        })
      }
    } catch {}
    setSaving(false)
  }

  const loadSellers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (selectedCountry?.id && String(selectedCountry.id) !== "ALL") params.set("country", String(selectedCountry.id))
      if (selectedState?.id) params.set("state", String(selectedState.id))
      if (selectedStatus?.id !== undefined) params.set("status", String(selectedStatus.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/sellers?${params.toString()}`, {
        headers: {
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
      })
      const data = await res.json()
      if (res.ok) {
        setSellers(Array.isArray(data.sellers) ? data.sellers : [])
        setTotal(Number(data.total || 0))
      } else {
        setSellers([])
        setTotal(0)
      }
    } catch {
      setSellers([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadSellers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, page, selectedCountry, selectedState, selectedStatus, search, sortKey, sortOrder])

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-2xl font-bold text-white">Seller Management</h1>
            <p className="text-indigo-100 text-sm">Approve and manage sellers</p>
          </div>
        </div>
        <span className="text-2xl font-semibold text-white">{total}</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
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
          <div>
            <CommonDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatus}
              onChange={onStatusFilterChange}
              placeholder="Select status"
            />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search sellers" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <BeautifulLoader/>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-4">
            <CommonTable
              columns={[
                { key: "logo", label: "Logo", render: (r) => {
                  const src = (r as Seller).businessLogoUrl
                  return src ? (
                    <div className="relative w-10 h-10">
                      <Image src={src} alt={(r as Seller).businessName} fill sizes="40px" className="rounded border object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded border bg-gray-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-gray-400" />
                    </div>
                  )
                } },
                { key: "businessName", label: "Business", sortable: true },
                { key: "ownerName", label: "Owner" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "address", label: "Address" },
                { key: "city", label: "City" },
                { key: "state", label: "State", sortable: true },
                { key: "district", label: "District" },
                { key: "pincode", label: "Pincode" },
                { key: "country", label: "Country", sortable: true },
                { key: "hasGST", label: "Has GST", render: (r) => ((r as Seller).hasGST ? "Yes" : "No") },
                { key: "gstNumber", label: "GST Number" },
                { key: "panNumber", label: "PAN Number" },
                { key: "aadhaar", label: "Aadhaar" },
                { key: "status", label: "Status", sortable: true, render: (r) => (
                  <select
                    defaultValue={r.status}
                    className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={(e) => updateStatus(r.id, e.currentTarget.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                ) },
                { key: "actions", label: "Actions", render: (r) => (
                  <button
                    className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => openReview(r as Seller)}
                  >
                    Review
                  </button>
                ) },
                { key: "createdAt", label: "Registered", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
              ]}
              data={sellers}
              sortKey={sortKey || undefined}
              sortOrder={sortOrder}
              onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
              rowKey={(r, i) => `${r.id}-${i}`}
            />
          </div>
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

        {selectedSeller && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" onClick={() => setSelectedSeller(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Review Seller</h3>
                <button onClick={() => setSelectedSeller(null)} className="text-gray-600 hover:text-gray-900">Close</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500">Business</div>
                  <div className="font-medium">{selectedSeller.businessName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Owner</div>
                  <div className="font-medium">{selectedSeller.ownerName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{selectedSeller.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{selectedSeller.phone}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="font-medium">{selectedSeller.address} {selectedSeller.city} {selectedSeller.state} {selectedSeller.pincode}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-sm text-gray-500">Bank Details</div>
                  <div className="font-medium">
                    {(selectedSeller.bankName || "-")} • {(selectedSeller.bankBranch || "-")}
                    <br />
                    A/C: {(selectedSeller.bankAccount || "-")} • IFSC: {(selectedSeller.bankIfsc || "-")}
                  </div>
                </div>
                {selectedSeller.bankDocumentUrl && (
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Bank Document</div>
                    <div className="relative w-full max-w-xs h-40">
                      <Image src={selectedSeller.bankDocumentUrl} alt="Bank Document" fill sizes="320px" className="object-cover rounded border" unoptimized />
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">GST</div>
                  <div className="font-medium">{selectedSeller.gstNumber || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">PAN</div>
                  <div className="font-medium">{selectedSeller.panNumber || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Aadhaar</div>
                  <div className="font-medium">{selectedSeller.aadhaar || "-"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <select
                    value={decisionStatus}
                    onChange={(e) => setDecisionStatus(e.currentTarget.value as any)}
                    className="border rounded-lg px-2 py-1 w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Decision Notes / Reason</label>
                <textarea
                  value={decisionNote}
                  onChange={(e) => setDecisionNote(e.currentTarget.value)}
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Write approval notes or rejection reason"
                />
                {decisionStatus === "rejected" && !decisionNote && (
                  <div className="text-xs text-red-600 mt-1">Rejection reason is required</div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                  onClick={() => setSelectedSeller(null)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${saving ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  onClick={saveDecision}
                  disabled={saving || (decisionStatus === "rejected" && !decisionNote)}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  onClick={() => { setDecisionStatus("approved"); saveDecision() }}
                  disabled={saving}
                >
                  Approve
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={() => { setDecisionStatus("rejected"); saveDecision() }}
                  disabled={saving || !decisionNote}
                >
                  Reject
                </button>
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

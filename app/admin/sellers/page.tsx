"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import locationData from "@/data/country.json"
import dynamic from "next/dynamic"
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
  country?: string
  status?: string
  hasGST?: boolean
  createdAt?: string
}

type DropdownItem = { id: string | number; label: string }

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || (authUser as any)?.role === "admin"
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

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])

  useEffect(() => {
    if (selectedCountry?.id === "IN") {
      const india = locationData.countries.find((c: any) => c.country === "India")
      const states = (india?.states || []).map((s: any) => ({ id: s.state, label: s.state }))
      setStateOptions(states)
    } else {
      setStateOptions([])
      setSelectedState(null)
    }
  }, [selectedCountry])

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

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
      const res = await fetch(`/api/admin/sellers?${params.toString()}`)
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
      <h1 className="text-2xl font-semibold">Seller Management</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <CommonDropdown
              label="Country"
              options={countryOptions}
              selected={selectedCountry as any}
              onChange={setSelectedCountry as any}
              placeholder="Select country"
            />
          </div>
          <div>
            <CommonDropdown
              label="State"
              options={stateOptions}
              selected={selectedState as any}
              onChange={setSelectedState as any}
              placeholder={selectedCountry?.id === "IN" ? "Select state" : "Not applicable"}
            />
          </div>
          <div>
            <CommonDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatus as any}
              onChange={setSelectedStatus as any}
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
          <div className="px-4 py-6 text-gray-700">Loading…</div>
        ) : (
          <CommonTable<Seller>
            columns={[
              { key: "businessName", label: "Business", sortable: true },
              { key: "ownerName", label: "Owner" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "city", label: "City" },
              { key: "state", label: "State", sortable: true },
              { key: "country", label: "Country", sortable: true },
              { key: "status", label: "Status", sortable: true },
              { key: "createdAt", label: "Registered", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={sellers}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r.id}
          />
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

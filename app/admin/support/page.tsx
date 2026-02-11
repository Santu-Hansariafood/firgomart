"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import dynamic from "next/dynamic"
const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type TicketRow = {
  id: string
  orderNumber: string
  buyerEmail?: string
  source?: string
  subject?: string
  message?: string
  status?: string
  priority?: string
  notesCount?: number
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

  const [rows, setRows] = useState<TicketRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const statusOptions: DropdownItem[] = [
    { id: "", label: "All Status" },
    { id: "open", label: "Open" },
    { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
    { id: "closed", label: "Closed" },
  ]
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem>(statusOptions[0])

  const priorityOptions: DropdownItem[] = [
    { id: "", label: "Any Priority" },
    { id: "low", label: "Low" },
    { id: "medium", label: "Medium" },
    { id: "high", label: "High" },
  ]
  const [selectedPriority, setSelectedPriority] = useState<DropdownItem>(priorityOptions[0])

  const sourceOptions: DropdownItem[] = [
    { id: "", label: "All Types" },
    { id: "enquiry", label: "Enquiry" },
  ]
  const [selectedSource, setSelectedSource] = useState<DropdownItem>(sourceOptions[0])

  useEffect(() => {
    if (!allowed) return
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", String(page))
        params.set("limit", String(pageSize))
        if (selectedStatus?.id !== undefined) params.set("status", String(selectedStatus.id))
        if (selectedPriority?.id !== undefined) params.set("priority", String(selectedPriority.id))
        if (selectedSource?.id !== undefined) params.set("source", String(selectedSource.id))
        if (search) params.set("search", search)
        if (sortKey) params.set("sortBy", String(sortKey))
        params.set("sortOrder", sortOrder)
        const res = await fetch(`/api/admin/support?${params.toString()}`)
        const data = await res.json()
        if (cancelled) return
        if (res.ok) {
          setRows(Array.isArray(data.tickets) ? data.tickets : [])
          setTotal(Number(data.total || 0))
        } else {
          setRows([])
          setTotal(0)
        }
      } catch {
        if (!cancelled) {
          setRows([])
          setTotal(0)
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [allowed, page, selectedStatus, selectedPriority, selectedSource, search, sortKey, sortOrder])

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {}
  }

  const addNote = async (id: string) => {
    const text = window.prompt("Add note") || ""
    if (!text) return
    try {
      const res = await fetch(`/api/admin/support/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (res.ok) setRows(prev => prev.map(r => r.id === id ? { ...r, notesCount: (r.notesCount || 0) + 1 } : r))
    } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Customer Support</h1>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <CommonDropdown
              label="Status"
              options={statusOptions}
              selected={selectedStatus}
              onChange={(v) => { if (!Array.isArray(v)) setSelectedStatus(v) }}
              placeholder="Status"
            />
          </div>
          <div>
            <CommonDropdown
              label="Priority"
              options={priorityOptions}
              selected={selectedPriority}
              onChange={(v) => { if (!Array.isArray(v)) setSelectedPriority(v) }}
              placeholder="Priority"
            />
          </div>
          <div>
            <CommonDropdown
              label="Type"
              options={sourceOptions}
              selected={selectedSource}
              onChange={(v) => { if (!Array.isArray(v)) setSelectedSource(v) }}
              placeholder="Type"
            />
          </div>
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search tickets" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable
            columns={[
              { key: "orderNumber", label: "Order", sortable: true },
              { key: "buyerEmail", label: "Email" },
              { key: "source", label: "Type" },
              { key: "subject", label: "Subject" },
              { key: "status", label: "Status", sortable: true, render: (r) => (
                <select defaultValue={r.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(r.id, e.currentTarget.value)}>
                  {statusOptions.filter(s => s.id !== "").map(s => (
                    <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                  ))}
                </select>
              ) },
              { key: "priority", label: "Priority" },
              { key: "notesCount", label: "Notes", render: (r) => (
                <button onClick={() => addNote(r.id)} className="px-2 py-1 rounded border">Add Note ({r.notesCount || 0})</button>
              ) },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
            ]}
            data={rows}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r.id}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
    )}
    </Suspense>
  )
}

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
  const [viewingTicket, setViewingTicket] = useState<TicketRow | null>(null)
  const [ticketNotes, setTicketNotes] = useState<{ time: string; author: string; text: string }[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [sendingFeedback, setSendingFeedback] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

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
    { id: "seller", label: "Seller Support" },
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
        if (selectedStatus?.id) params.set("status", String(selectedStatus.id))
        if (selectedPriority?.id) params.set("priority", String(selectedPriority.id))
        if (selectedSource?.id) params.set("source", String(selectedSource.id))
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
  }, [allowed, page, selectedStatus, selectedPriority, selectedSource, search, sortKey, sortOrder, refreshKey])

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

  const replyToTicket = async (id: string) => {
    const text = window.prompt("Reply message") || ""
    if (!text) return
    try {
      const res = await fetch(`/api/admin/support/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      if (!res.ok) {
        window.alert("Failed to send reply")
      } else {
        window.alert("Reply sent")
      }
    } catch {
      window.alert("Failed to send reply")
    }
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
      if (res.ok) {
        setRows(prev => prev.map(r => r.id === id ? { ...r, notesCount: (r.notesCount || 0) + 1 } : r))
        if (viewingTicket?.id === id) {
          const nRes = await fetch(`/api/admin/support/${id}`)
          const nData = await nRes.json()
          if (nRes.ok) setTicketNotes(nData.ticket?.notes || [])
        }
      }
    } catch {}
  }

  const openTicket = async (ticket: TicketRow) => {
    setViewingTicket(ticket)
    setFeedbackText("")
    setLoadingNotes(true)
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`)
      const data = await res.json()
      if (res.ok) {
        setTicketNotes(data.ticket?.notes || [])
      }
    } catch {
      setTicketNotes([])
    }
    setLoadingNotes(false)
  }

  const sendFeedbackAsReply = async () => {
    if (!viewingTicket || !feedbackText.trim() || sendingFeedback) return
    setSendingFeedback(true)
    try {
      const res = await fetch(`/api/admin/support/${viewingTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedbackText.trim() }),
      })
      if (res.ok) {
        window.alert("Feedback sent as reply email successfully")
        setFeedbackText("")
        // Refresh notes
        const nRes = await fetch(`/api/admin/support/${viewingTicket.id}`)
        const nData = await nRes.json()
        if (nRes.ok) setTicketNotes(nData.ticket?.notes || [])
      } else {
        const d = await res.json()
        window.alert(d.error || "Failed to send feedback")
      }
    } catch {
      window.alert("Failed to send feedback")
    }
    setSendingFeedback(false)
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <AdminLogin />
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">Enquiries & Support</h1>
        <button 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex items-center gap-2 text-sm"
          title="Refresh Data"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

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
              { key: "source", label: "Type", render: (r) => {
                const row = r as TicketRow
                if (row.source === 'enquiry') return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">Enquiry</span>
                if (row.source === 'seller') return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">Seller Support</span>
                return <span className="capitalize">{row.source || 'General'}</span>
              }},
              { key: "subject", label: "Subject" },
              { key: "status", label: "Status", sortable: true, render: (r) => {
                const row = r as TicketRow
                return (
                <select defaultValue={row.status} className="border rounded px-2 py-1" onChange={(e) => updateStatus(row.id, e.currentTarget.value)}>
                  {statusOptions.filter(s => s.id !== "").map(s => (
                    <option key={String(s.id)} value={String(s.id)}>{s.label}</option>
                  ))}
                </select>
              )}},
              { key: "priority", label: "Priority" },
              { key: "notesCount", label: "Notes / Reply", render: (r) => {
                const row = r as TicketRow
                return (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openTicket(row)}
                    className="px-2 py-1 rounded border text-xs bg-gray-50 hover:bg-gray-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => addNote(row.id)}
                    className="px-2 py-1 rounded border text-xs"
                  >
                    Add Note ({row.notesCount || 0})
                  </button>
                  {row.buyerEmail && (
                    <button
                      onClick={() => replyToTicket(row.id)}
                      className="px-2 py-1 rounded border text-xs bg-brand-purple/5 text-brand-purple"
                    >
                      Reply by Email
                    </button>
                  )}
                </div>
              )}},
              { key: "createdAt", label: "Created", sortable: true, render: (r) => {
                const row = r as TicketRow
                return row.createdAt ? new Date(row.createdAt).toLocaleString() : ""
              }},
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

      {viewingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h2 className="font-semibold text-lg">Ticket Details</h2>
              <button onClick={() => setViewingTicket(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Source</p>
                  <p className="font-medium capitalize">{viewingTicket.source}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Email</p>
                  <p className="font-medium">{viewingTicket.buyerEmail || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider">Subject</p>
                  <p className="font-medium">{viewingTicket.subject || 'No Subject'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-2">Message</p>
                <div className="p-4 bg-gray-50 rounded-xl border text-sm whitespace-pre-wrap">
                  {viewingTicket.message || 'No message content'}
                </div>
              </div>

              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-2">Send Feedback / Reply</p>
                <div className="space-y-2">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter feedback or reply to send via email..."
                    className="w-full p-3 text-sm border rounded-xl bg-white focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none transition-all resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={sendFeedbackAsReply}
                      disabled={!feedbackText.trim() || sendingFeedback}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-purple rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                      {sendingFeedback ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      Send Feedback via Email
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-gray-500 uppercase text-[10px] font-bold tracking-wider mb-2">Internal Notes & History</p>
                <div className="space-y-3">
                  {loadingNotes ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : ticketNotes.length > 0 ? (
                    ticketNotes.map((note, i) => (
                      <div key={i} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-purple-900 text-xs">{note.author || 'System'}</span>
                          <span className="text-[10px] text-purple-400">{new Date(note.time).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-700">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-gray-400 text-sm italic">No notes yet</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => addNote(viewingTicket.id)}
                className="px-4 py-2 text-sm font-medium text-brand-purple bg-white border border-brand-purple rounded-lg hover:bg-brand-purple/5 transition-colors"
              >
                Add Note
              </button>
              {viewingTicket.buyerEmail && (
                <button
                  onClick={() => { replyToTicket(viewingTicket.id) }}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-purple rounded-lg hover:bg-brand-purple/90 transition-colors shadow-sm"
                >
                  Reply by Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </Suspense>
  )
}

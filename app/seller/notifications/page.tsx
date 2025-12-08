"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BackButton from "@/components/common/BackButton/BackButton"

type Note = { type: string; message: string; createdAt?: string }

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    const load = async () => {
      if (!email) return
      const res = await fetch(`/api/seller/notifications?sellerEmail=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) setNotes(data.notifications || [])
      else setNotes([])
    }
    load()
  }, [email])

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
    {!allowed ? (
      <div className="p-6">Login as seller to view notifications.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        {notes.map((n, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">{n.type}</span>
            <span className="font-medium">{n.message}</span>
            <span className="text-xs text-gray-500">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
          </div>
        ))}
        {notes.length === 0 && <p className="text-sm text-gray-500">No notifications</p>}
      </div>
    </div>
    )}
    </Suspense>
  )
}


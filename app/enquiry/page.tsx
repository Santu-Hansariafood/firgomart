"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import BackButton from "@/components/common/BackButton/BackButton"
import { MessageCircle, Home, Loader2 } from "lucide-react"

export default function EnquiryPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const canSubmit = !!user?.email && subject.trim().length > 0 && message.trim().length > 0 && !loading

  const submit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setStatus("idle")
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name || "",
          email: user?.email || "",
          subject: subject.trim(),
          message: message.trim(),
          source: "enquiry",
        }),
      })
      if (res.ok) {
        setStatus("success")
        setSubject("")
        setMessage("")
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <BackButton />
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-semibold"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-brand-purple" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Enquiry</h1>
          <p className="text-sm text-foreground/70">
            Share your question with us. Our team will get back to you.
          </p>
        </div>
      </div>

      {!user?.email && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
          Please login to Firgomart so we can attach this enquiry to your account.
        </div>
      )}

      <div className="space-y-3 bg-white border border-foreground/5 rounded-2xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Name</span>
            <div className="px-3 py-2 rounded-lg border border-foreground/10 bg-background/60 text-foreground/80 text-sm">
              {user?.name || "-"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Email</span>
            <div className="px-3 py-2 rounded-lg border border-foreground/10 bg-background/60 text-foreground/80 text-sm">
              {user?.email || "-"}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.currentTarget.value)}
            placeholder="Briefly describe your enquiry"
            className="w-full px-3 py-2 text-sm rounded-lg border border-foreground/15 bg-white/95"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
            Message
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            placeholder="Write your enquiry with details..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-foreground/15 bg-white/95 resize-none"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-purple text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Enquiry
        </button>

        {status === "success" && (
          <p className="text-[12px] text-emerald-600">
            Enquiry submitted successfully. We will reach out on your registered email.
          </p>
        )}
        {status === "error" && (
          <p className="text-[12px] text-red-600">
            Could not submit enquiry. Please try again after some time.
          </p>
        )}
      </div>
    </div>
  )
}


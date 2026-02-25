"use client"
import Link from "next/link"
import BackButton from "@/components/common/BackButton/BackButton"
import { MessageCircle, Home } from "lucide-react"
import EnquiryForm from "@/components/ui/EnquiryForm/EnquiryForm"
import useEnquiry from "@/hooks/enquiry/useEnquiry"
export default function EnquiryPage() {
  const { user, subject, setSubject, message, setMessage, loading, status, canSubmit, submit } = useEnquiry()
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      <div className="flex items-center justify-between gap-3 mb-1">
        <BackButton />
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--foreground)/20] bg-[var(--background)] hover:bg-[var(--background)/80] text-[color:var(--foreground)] text-xs font-semibold"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </Link>
      </div>
 
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--foreground)/10] flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-brand-purple" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Enquiry</h1>
          <p className="text-sm text-foreground/70">
            Share your question with us. Our team will get back to you.
          </p>
        </div>
      </div>
      <EnquiryForm
        userName={user?.name}
        userEmail={user?.email}
        subject={subject}
        setSubject={(v) => setSubject(v)}
        message={message}
        setMessage={(v) => setMessage(v)}
        canSubmit={canSubmit}
        submit={submit}
        loading={loading}
        status={status}
      />
    </div>
  )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { ShieldCheck, Mail, Hash, RefreshCw } from "lucide-react"

export default function AdminLogin() {
  const router = useRouter()
  const [next, setNext] = useState("/admin")
  useEffect(() => {
    try {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null
      const n = params?.get("next") || "/admin"
      setNext(n)
    } catch {}
  }, [])
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [step, setStep] = useState<"request" | "verify">("request")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugOtp, setDebugOtp] = useState<string | null>(null)

  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)

  const requestOtp = async () => {
    setLoading(true)
    setError(null)
    setDebugOtp(null)
    try {
      const res = await fetch("/api/admin/login/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to request OTP")
      if (typeof data?.otp === "string") setDebugOtp(data.otp)
      setStep("verify")
      setOtpValues(["", "", "", "", "", ""])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong"
      setError(msg)
    }
    setLoading(false)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return
    const next = [...otpValues]
    next[index] = value
    setOtpValues(next)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("")
    const next = [...otpValues]
    pasted.forEach((val, idx) => {
      if (idx < 6 && !isNaN(Number(val))) {
        next[idx] = val
      }
    })
    setOtpValues(next)
    if (pasted.length > 0) {
      otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const verifyOtp = async () => {
    const code = otpValues.join("")
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit OTP")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Invalid or expired OTP")
      const admin = data?.admin
      const ok = await login(admin)
      if (!ok) throw new Error("Login failed")
      router.push(next)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong"
      setError(msg)
    }
    setLoading(false)
  }

  const resend = () => {
    setOtpValues(["", "", "", "", "", ""])
    requestOtp()
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl bg-[var(--background)] border border-[var(--foreground)/10]"
      >
        <div className="relative px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 bg-brand-purple text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_#ffffff40,_transparent_60%)]" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black/10 px-3 py-1 text-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                Admin Portal
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shadow-lg shadow-black/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold leading-snug">Secure Admin Login</h1>
                  <p className="text-xs sm:text-sm text-white/80">
                    Sign in with your verified admin email to manage FirgoMart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-5 bg-[var(--background)]">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/25 text-red-600 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {step === "request" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[color:var(--foreground)] ml-0.5">
                  Admin email
                </label>
                <p className="text-xs text-[var(--foreground)/60]">
                  Enter a whitelisted admin email to receive a one-time verification code.
                </p>
              </div>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/40] group-focus-within:text-brand-purple transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-[color:var(--foreground)] placeholder:text-[var(--foreground)/30] transition-all duration-200"
                />
              </div>
              <button
                onClick={requestOtp}
                disabled={loading || !validEmail}
                className="w-full py-3.5 bg-brand-purple text-white rounded-xl font-semibold text-base shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  "Send verification code"
                )}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[color:var(--foreground)] ml-0.5">
                  Enter verification code
                </label>
                <p className="text-xs text-[var(--foreground)/60]">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-medium text-brand-purple">{email}</span>. Enter it below to continue.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex gap-2 flex-1 justify-between">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => { otpRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-semibold bg-[var(--background)] border border-[var(--foreground)/15] rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-[color:var(--foreground)] transition-all"
                    />
                  ))}
                </div>
              </div>
              {debugOtp && (
                <div className="text-xs text-[var(--foreground)/60] bg-brand-purple/5 border border-brand-purple/15 rounded-lg px-3 py-2">
                  Demo code for testing:{" "}
                  <span className="font-mono font-semibold text-brand-purple tracking-widest">
                    {debugOtp}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={verifyOtp}
                  disabled={loading || otpValues.join("").length !== 6}
                  className="flex-1 bg-brand-purple text-white py-3.5 rounded-xl font-semibold hover:bg-brand-red transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={resend}
                  className="flex items-center justify-center gap-2 flex-1 bg-[var(--foreground)/5] text-[color:var(--foreground)] py-3.5 rounded-xl font-medium hover:bg-[var(--foreground)/10] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Resend
                </button>
              </div>
              <button
                onClick={() => setStep("request")}
                className="w-full border border-[var(--foreground)/10] rounded-xl py-2.5 text-sm text-[var(--foreground)/80] hover:bg-[var(--foreground)/5] transition-colors"
              >
                Change email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
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
  const [otp, setOtp] = useState("")
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong"
      setError(msg)
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
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
    setOtp("")
    requestOtp()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl bg-white"
      >
        <div className="bg-linear-to-r from-blue-700 to-blue-500 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" />
            <h1 className="text-xl font-heading font-bold">Admin Access</h1>
          </div>
          <p className="text-sm text-blue-100 mt-1">Secure OTP verification for admin login</p>
        </div>

        <div className="p-6 space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

          {step === "request" && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Admin email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={requestOtp}
                disabled={loading || !validEmail}
                className="w-full bg-linear-to-r from-blue-700 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-blue-800 hover:to-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <p className="text-xs text-gray-500">Only whitelisted admin emails can request OTP.</p>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Enter OTP</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              {debugOtp && <p className="text-xs text-gray-500">Demo OTP: {debugOtp}</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={verifyOtp}
                  disabled={loading || otp.length < 6}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={resend}
                  className="flex items-center justify-center gap-2 flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <RefreshCw className="w-4 h-4" /> Resend
                </button>
              </div>
              <button
                onClick={() => setStep("request")}
                className="w-full border rounded-lg py-2 text-gray-700 hover:bg-gray-50"
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


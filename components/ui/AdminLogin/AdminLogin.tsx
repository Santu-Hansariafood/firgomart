"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AdminLogin() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/admin"
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"request" | "verify">("request")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugOtp, setDebugOtp] = useState<string | null>(null)

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
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
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
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-heading font-bold text-gray-900 mb-6">Admin Login</h1>

        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}

        {step === "request" && (
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full px-3 py-2 border rounded"
            />
            <button
              onClick={requestOtp}
              disabled={loading || !email}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-3 py-2 border rounded tracking-widest"
            />
            {debugOtp && (
              <p className="text-xs text-gray-500">Demo OTP: {debugOtp}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length < 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
              <button
                onClick={() => setStep("request")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Change email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


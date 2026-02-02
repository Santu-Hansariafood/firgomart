"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { Lock } from "lucide-react"

const Title = dynamic(() => import("@/components/common/Title/Title"))
const Paragraph = dynamic(() => import("@/components/common/Paragraph/Paragraph"))

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email || !token) {
      setError("Invalid or missing reset link")
    }
  }, [email, token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !token) {
      setError("Invalid or missing reset link")
      return
    }
    setError("")
    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login?mode=login")
        }, 3000)
      } else {
        setError(typeof data?.error === "string" ? data.error : "Unable to reset password")
      }
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[color:var(--foreground)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl shadow-2xl border border-[var(--foreground)/20] bg-[var(--background)] overflow-hidden"
      >
        <div className="bg-linear-to-r from-brand-purple to-brand-red p-6">
          <Title level={2} className="text-white">
            Reset Password
          </Title>
          <Paragraph className="text-white/80 mt-1 text-sm">
            Choose a new password for your FirgoMart account
          </Paragraph>
        </div>
        <div className="p-6 space-y-4">
          {success ? (
            <div className="space-y-2 text-center">
              <Title level={4} className="text-[color:var(--foreground)]">
                Password Updated
              </Title>
              <Paragraph className="text-[var(--foreground)/70] text-sm">
                Your password has been reset successfully. Redirecting to login...
              </Paragraph>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Paragraph className="text-[var(--foreground)/70] text-sm">
                Enter a strong new password below. Make sure you remember it for next time.
              </Paragraph>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/50]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--foreground)/20] rounded-lg bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/50] focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)/50]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-[var(--foreground)/20] rounded-lg bg-[var(--background)] text-[color:var(--foreground)] placeholder:text-[var(--foreground)/50] focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email || !token}
                className="w-full bg-linear-to-r from-brand-purple to-brand-red text-white py-3 rounded-lg font-medium hover:from-brand-red hover:to-brand-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}


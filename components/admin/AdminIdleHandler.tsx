"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useAuth } from "@/context/AuthContext"
import { useSession } from "next-auth/react"

const TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes
const WARNING_MS = 60 * 1000 // 60 seconds warning
const CHECK_INTERVAL = 1000

export default function AdminIdleHandler() {
  const { user: authUser, logout } = useAuth()
  const { data: session } = useSession()
  
  const isAdmin = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const lastActivity = useRef<number>(Date.now())

  useEffect(() => {
    if (!isAdmin) return

    const updateActivity = () => {
      lastActivity.current = Date.now()
      if (showWarning) {
        setShowWarning(false)
        setCountdown(60)
      }
    }

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"]
    events.forEach(event => window.addEventListener(event, updateActivity))

    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity.current
      const timeRemaining = TIMEOUT_MS - timeSinceLastActivity

      if (timeRemaining <= 0) {
        logout("/admin-login")
        clearInterval(interval)
      } else if (timeRemaining <= WARNING_MS) {
        setShowWarning(true)
        setCountdown(Math.ceil(timeRemaining / 1000))
      } else {
        if (showWarning) setShowWarning(false)
      }
    }, CHECK_INTERVAL)

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
      clearInterval(interval)
    }
  }, [isAdmin, showWarning, logout])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Session Expiring</h2>
          <p className="text-sm text-gray-500 mt-2">
            You have been inactive for a while. You will be logged out in{" "}
            <span className="font-bold text-red-600 text-lg">{countdown}</span> seconds.
          </p>
        </div>
        <p className="text-xs text-gray-400">Move your cursor or click anywhere to stay logged in.</p>
        <button
          onClick={() => {
            lastActivity.current = Date.now()
            setShowWarning(false)
          }}
          className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-200"
        >
          Stay Logged In
        </button>
      </div>
    </div>
  )
}

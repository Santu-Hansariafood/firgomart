"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const nextPath = typeof window !== 'undefined' ? window.location.pathname : '/'
      router.push(`/login?next=${encodeURIComponent(nextPath)}`)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-[var(--foreground)] bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mr-2" />
        Checking authentication...
      </div>
    )
  }

  return <>{user ? children : null}</>
}

export default ProtectedRoute

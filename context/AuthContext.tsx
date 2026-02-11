"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

interface SellerDetails {
  id: string
  businessName: string
  ownerName: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  district?: string
  pincode?: string
  gstNumber?: string
  panNumber?: string
  hasGST?: boolean
  businessLogoUrl?: string
  status?: string
}

interface User {
  id?: string
  email: string
  name?: string
  role?: string
  phone?: string
  mobile?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  sellerDetails?: SellerDetails
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (userData: any) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: (redirectPath?: string) => void
  updateUser: (updatedData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem("firgomart_user")
      if (!raw) return
      const stored = JSON.parse(raw) as User | null
      if (stored && stored.email) {
        setUser(stored)
        setIsAuthenticated(true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      const sUser = (session?.user as User) || null
      const cleaned = sUser ? { ...sUser } : null
      if (cleaned && String(cleaned.role || "").toLowerCase() !== "seller") {
        delete (cleaned as any).sellerDetails
      }
      setUser(cleaned)
      setIsAuthenticated(!!cleaned)
      const safeJson = async (res: Response) => {
        try {
          return await res.json()
        } catch {
          try {
            const t = await res.text()
            return { errorText: t }
          } catch {
            return {}
          }
        }
      }
      fetch("/api/auth/profile")
        .then(async (res) => {
          if (res.status === 401 || res.status === 403) {
            signOut({ redirect: false })
            setUser(null)
            setIsAuthenticated(false)
            return
          }
          const data = await safeJson(res)
          if (res.ok && (data as any)?.user) {
            const u = (data as any).user as User
            if (String(u.role || "").toLowerCase() !== "seller") delete (u as any).sellerDetails
            setUser(u)
            if (typeof window !== "undefined") {
              try {
                window.localStorage.setItem("firgomart_user", JSON.stringify(u))
              } catch {}
            }
            setIsAuthenticated(true)
          }
        })
        .catch(() => {})
    } else if (status === "unauthenticated") {
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("firgomart_user")
          if (raw) {
            const stored = JSON.parse(raw) as User | null
            if (stored && stored.email) {
              setUser(stored)
              setIsAuthenticated(true)
            } else {
              setUser(null)
              setIsAuthenticated(false)
            }
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch {
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(status === "loading")
  }, [status, session])

  const login = async (userData: any) => {
    if (userData?.email && userData?.password) {
      const res = await signIn("credentials", {
        redirect: false,
        email: userData.email,
        password: userData.password,
      })
      const ok = res?.ok === true
      if (ok) router.push("/")
      return ok
    }
    const nextUser = (userData || null) as User | null
    setUser(nextUser)
    setIsAuthenticated(!!nextUser)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("firgomart_user", JSON.stringify(nextUser))
      } catch {}
    }
    return true
  }

  const register = async (userData: any) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (res.status === 409) {
        try {
          const data = await res.json()
          const target = (data as any)?.redirectTo || "/login"
          router.push(target)
        } catch {
          router.push("/login")
        }
        return false
      }
      if (!res.ok) return false
      await signIn("credentials", {
        redirect: false,
        email: userData.email,
        password: userData.password,
      })
      return true
    } catch {
      return false
    }
  }

  const logout = useCallback((redirectPath: string = "/login") => {
    signOut({ redirect: false })
    router.push(redirectPath)
    setUser(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem("firgomart_user")
      localStorage.removeItem("admin_last_activity")
    }
  }, [router])

  useEffect(() => {
    if (!user || String(user.role || "").toLowerCase() !== "admin") return

    const TIMEOUT_MS = 15 * 60 * 1000
    let timeoutId: NodeJS.Timeout

    const handleLogout = () => {
      logout("/login")
    }

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleLogout, TIMEOUT_MS)
    }

    resetTimer()

    const events = ["mousedown", "mousemove", "keydown", "click", "scroll", "touchstart"]
    
    events.forEach(event => document.addEventListener(event, resetTimer))

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      events.forEach(event => document.removeEventListener(event, resetTimer))
    }
  }, [user, logout])

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("firgomart_user", JSON.stringify(updatedUser))
      } catch {}
    }
    try {
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })
    } catch (err) {
      console.error("Failed to update profile", err)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

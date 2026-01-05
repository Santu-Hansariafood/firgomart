"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

interface User {
  id?: string
  email: string
  name?: string
  mobile?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (userData: any) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
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
    if (status === "authenticated") {
      setUser(prev => ({ ...prev, ...(session?.user as User) }))
      setIsAuthenticated(true)
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
          const data = await safeJson(res)
          if (res.ok && (data as any)?.user) setUser((data as any).user as User)
        })
        .catch(() => {})
    } else if (status === "unauthenticated") {
      setUser(prev => {
        const keep = (prev as any)?.role === "admin"
        return keep ? prev : null
      })
      setIsAuthenticated(prev => {
        const keep = !!(user && (user as any).role === "admin")
        return keep ? true : false
      })
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
    setUser(userData || null)
    setIsAuthenticated(!!userData)
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

  const logout = () => {
    signOut({ redirect: false })
    router.push("/login")
  }

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updatedData }
    setUser(updatedUser)
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

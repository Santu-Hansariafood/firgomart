import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext/CartContext"
import { useGeolocation } from "@/hooks/product-grid/useGeolocation"

export type SellerInfo = {
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

export const useNavbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showOffers, setShowOffers] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("theme") as "light" | "dark" | null) : null
      const systemDark =
        typeof window !== "undefined"
          ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          : false
      return saved || (systemDark ? "dark" : "light")
    } catch {
      return "light"
    }
  })

  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { cartItems, setShowCart } = useCart()
  const { deliverToState, requestLocation, loading: locationLoading } = useGeolocation()

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const sellerInfo = (user?.sellerDetails || null) as SellerInfo | null

  // URL Params cleanup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      const paramsToRemove = [
        "search",
        "category",
        "subcategory",
        "minPrice",
        "maxPrice",
        "sort",
        "rating",
        "size",
        "offer"
      ]
      
      let hasChanges = false
      paramsToRemove.forEach(param => {
        if (url.searchParams.has(param)) {
          url.searchParams.delete(param)
          hasChanges = true
        }
      })

      if (hasChanges) {
        router.replace(url.pathname + url.search)
        setSearchQuery("")
      }
    }
  }, [])

  // Theme effect
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme])

  // Location modal auto-show
  useEffect(() => {
    if (typeof window !== 'undefined' && !deliverToState && isAuthenticated) {
      const seen = sessionStorage.getItem('location_modal_seen')
      if (!seen) {
        const timer = setTimeout(() => {
          setShowLocationModal(true)
          sessionStorage.setItem('location_modal_seen', 'true')
        }, 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [deliverToState, isAuthenticated])

  const getInitials = (n?: string | null, e?: string | null) => {
    const name = String(n || "").trim()
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean)
      return parts.slice(0, 2).map(p => (p[0] || "").toUpperCase()).join("")
    }
    const email = String(e || "").trim()
    if (email) {
      const local = email.split("@")[0] || ""
      const parts = local.split(/[.\-_]+/).filter(Boolean)
      const out = parts.slice(0, 2).map(p => (p[0] || "").toUpperCase()).join("")
      return out || (local[0] || "").toUpperCase()
    }
    return ""
  }
  const initials = getInitials(user?.name, user?.email)

  const handleSearch = useCallback((q: string) => {
    const s = (q || "").trim()
    if (s) {
      router.push(`/?search=${encodeURIComponent(s)}`)
    }
  }, [router])

  const toggleTheme = () => {
    const nextTheme: "light" | "dark" = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    try {
      localStorage.setItem("theme", nextTheme)
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", nextTheme)
    }
  }

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowForgotModal(false)
    setShowLoginModal(true)
  }

  const handleSwitchToForgot = () => {
    setShowLoginModal(false)
    setShowForgotModal(true)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const handleRequestLocation = async () => {
    await requestLocation()
    setShowLocationModal(false)
  }

  return {
    state: {
      searchQuery,
      mobileMenuOpen,
      showOffers,
      showLoginModal,
      showRegisterModal,
      showForgotModal,
      showUserMenu,
      showLocationModal,
      theme,
      cartCount,
      sellerInfo,
      initials,
      user,
      isAuthenticated,
      locationLoading,
      deliverToState
    },
    actions: {
      setSearchQuery,
      setMobileMenuOpen,
      setShowOffers,
      setShowLoginModal,
      setShowRegisterModal,
      setShowForgotModal,
      setShowUserMenu,
      setShowLocationModal,
      setShowCart,
      toggleTheme,
      handleSearch,
      handleSwitchToRegister,
      handleSwitchToLogin,
      handleSwitchToForgot,
      handleLogout,
      handleRequestLocation
    }
  }
}

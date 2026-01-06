"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ShoppingCart,
  Store,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext/CartContext"
import dynamic from "next/dynamic"
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const LoginModal = dynamic(() => import("@/components/auth/LoginModal/LoginModal"))
const RegisterModal = dynamic(() => import("@/components/auth/RegisterModal/RegisterModal"))
const ForgotPasswordModal = dynamic(() => import("@/components/auth/ForgotPasswordModal/ForgotPasswordModal"))

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { cartItems, setShowCart } = useCart()
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)

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

  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginModal(false)
      setShowRegisterModal(false)
      setShowForgotModal(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("theme") as "light" | "dark" | null : null
      const systemDark = typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches : false
      const nextTheme: "light" | "dark" = saved || (systemDark ? "dark" : "light")
      setTheme(nextTheme)
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", nextTheme)
      }
    } catch {}
  }, [])

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

  return (
    <nav className="sticky top-0 z-50 bg-[var(--background)] text-[var(--foreground)] shadow-md">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">

          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
              <Image
                src="/logo/firgomart.png"
                alt="Firgomart Logo"
                fill
                priority
                sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, (max-width: 1024px) 80px, 80px"
                className="object-contain rounded-lg"
              />
            </div>
          </Link>
          <div className="hidden md:flex flex-1 min-w-0 mx-4">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={(q) => { const s = (q || "").trim(); if (s) router.push(`/?search=${encodeURIComponent(s)}`) }}
              placeholder="Search for products, brands and more..."
            />
          </div>
          <div className="hidden md:flex items-center space-x-4 flex-none">
            <Link
              href="/seller-registration"
              className="flex items-center space-x-2 px-4 py-2 text-brand-purple hover:bg-[var(--foreground)/10] rounded-lg transition-colors"
            >
              <Store className="w-5 h-5" />
              <span className="font-medium">Sell on Firgomart</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foreground)/10] rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center border border-red-600">
                    <span className="text-base font-black text-red-700 leading-none">{initials}</span>
                  </div>
                  <span className="font-medium">{user?.name?.split(" ")[0] || user?.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-lg py-2 z-50"
                    >
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foreground)/10] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-brand-purple hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 bg-linear-to-r from-brand-purple to-brand-red text-white rounded-lg font-medium hover:from-brand-red hover:to-brand-purple transition-all"
                >
                  Register
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-2 px-4 py-2 text-[var(--foreground)] hover:bg-[var(--foreground)/10] rounded-lg transition-colors"
              suppressHydrationWarning
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--foreground)/10] transition-colors"
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--foreground)] hover:bg-[var(--foreground)/10] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <div className="md:hidden pb-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(q) => { const s = (q || "").trim(); if (s) router.push(`/?search=${encodeURIComponent(s)}`) }}
            placeholder="Search products..."
          />
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--background)] border-t border-[var(--foreground)/20]"
          >
            <div className="px-4 py-4 space-y-3">
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false) }}
                    className="px-4 py-3 text-brand-purple hover:bg-[var(--foreground)/10] rounded-lg font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false) }}
                    className="px-4 py-3 bg-linear-to-r from-brand-purple to-brand-red text-white rounded-lg font-medium hover:from-brand-red hover:to-brand-purple transition-all"
                  >
                    Register
                  </button>
                </div>
              )}
              {isAuthenticated && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-[var(--foreground)/5] rounded-lg">
                  <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-[var(--background)] rounded-full flex items-center justify-center border border-red-600">
                        <span className="text-base font-black text-red-700 leading-none">{initials}</span>
                      </div>
                      <span className="font-medium truncate max-w-[10rem]">
                        {user?.name?.split(" ")[0] || user?.email}
                      </span>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--foreground)/10] rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </div>
              )}
              <Link
                href="/seller-registration"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 text-brand-purple hover:bg-[var(--foreground)/10] rounded-lg"
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Sell on Firgomart</span>
              </Link>
              <button
                onClick={() => {
                  setShowCart(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-[var(--foreground)] hover:bg-[var(--foreground)/10] rounded-lg"
                suppressHydrationWarning
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="w-6 h-6 bg-red-500 text-white text-sm rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgot={handleSwitchToForgot}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </nav>
  )
}

export default Navbar

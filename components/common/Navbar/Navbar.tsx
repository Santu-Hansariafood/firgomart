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
  Truck,
  Heart,
  Gift,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext/CartContext"
import dynamic from "next/dynamic"
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const LoginModal = dynamic(() => import("@/components/auth/LoginModal/LoginModal"))
const RegisterModal = dynamic(() => import("@/components/auth/RegisterModal/RegisterModal"))
const ForgotPasswordModal = dynamic(() => import("@/components/auth/ForgotPasswordModal/ForgotPasswordModal"))

type SellerInfo = {
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

const OffersOverlay = dynamic(() => import("@/components/common/OffersOverlay/OffersOverlay"), { ssr: false })
const BottomNav = dynamic(() => import("@/components/common/BottomNav/BottomNav"))

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showOffers, setShowOffers] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
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
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const sellerInfo = (user?.sellerDetails || null) as SellerInfo | null

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
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme])

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
    <>
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-[10px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide z-[60] relative">
        <p className="flex items-center justify-center gap-2">
          <span>Get the best experience on our App!</span>
          <Link href="/download-app" className="underline hover:text-white/90 font-bold decoration-white/50 underline-offset-2">
            Download Now
          </Link>
        </p>
      </div>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-[var(--foreground)/5] shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-foreground/80 hover:bg-foreground/5 rounded-full transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="flex-shrink-0 relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-transform hover:scale-105 active:scale-95">
                <Image
                  src="/logo/firgomart.png"
                  alt="Firgomart"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 48px, 64px"
                />
              </Link>
            </div>
            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={(q) => { const s = (q || "").trim(); if (s) router.push(`/?search=${encodeURIComponent(s)}`) }}
                placeholder="Search for products, brands and more..."
                enableSuggestions={true}
                className="shadow-sm hover:shadow-md transition-all duration-300"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowOffers(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-brand-purple hover:bg-brand-purple/5 rounded-full transition-all"
              >
                <Gift className="w-4 h-4" />
                <span>Offers</span>
              </button>
              <Link
                href="/seller-registration"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 hover:text-brand-purple hover:bg-brand-purple/5 rounded-full transition-all"
              >
                <Store className="w-4 h-4" />
                <span>Sell on Firgomart</span>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground/60 hover:text-brand-purple hover:bg-foreground/5 rounded-full transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-foreground/80 hover:text-brand-purple hover:bg-foreground/5 rounded-full transition-colors group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-background">
                    {cartCount}
                  </span>
                )}
              </button>
              {isAuthenticated ? (
                <div className="relative ml-1">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-foreground/5 transition-all border border-transparent hover:border-foreground/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-red p-[1px]">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        {sellerInfo?.businessLogoUrl ? (
                          <Image src={sellerInfo.businessLogoUrl} alt="Avatar" width={32} height={32} className="object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-brand-purple">{initials}</span>
                        )}
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 mt-3 w-72 bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden ring-1 ring-black/5"
                      >
                         {user?.role === "seller" ? (
                           <>
                            <div className="px-5 py-4 bg-foreground/5 border-b border-foreground/10">
                              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1">Seller Account</p>
                              <p className="font-bold text-foreground truncate">{sellerInfo?.businessName || user?.name}</p>
                              <p className="text-sm text-foreground/60 truncate">{user?.email}</p>
                            </div>
                            <div className="p-2">
                               <Link href="/seller/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors">
                                 <User className="w-4 h-4" /> Seller Profile
                               </Link>
                               <div className="grid grid-cols-2 gap-1 mt-1">
                                  <div className="px-3 py-2 rounded-lg bg-foreground/5">
                                    <p className="text-[10px] text-foreground/50">Status</p>
                                    <p className="text-xs font-semibold">{sellerInfo?.status || "—"}</p>
                                  </div>
                                  <div className="px-3 py-2 rounded-lg bg-foreground/5">
                                    <p className="text-[10px] text-foreground/50">GST</p>
                                    <p className="text-xs font-semibold truncate">{sellerInfo?.gstNumber || "—"}</p>
                                  </div>
                               </div>
                            </div>
                           </>
                         ) : (
                           <>
                             <div className="px-5 py-4 bg-foreground/5 border-b border-foreground/10">
                               <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-1">My Account</p>
                               <p className="font-bold text-foreground truncate">{user?.name}</p>
                               <p className="text-sm text-foreground/60 truncate">{user?.email}</p>
                             </div>
                             <div className="p-2 space-y-1">
                               <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors">
                                 <User className="w-4 h-4" /> My Profile
                               </Link>
                               <Link href="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors">
                                 <Truck className="w-4 h-4" /> My Orders
                               </Link>
                               <Link href="/wishlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-colors">
                                 <Heart className="w-4 h-4" /> My Wishlist
                               </Link>
                             </div>
                           </>
                         )}
                         <div className="p-2 border-t border-foreground/10 mt-1">
                           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                             <LogOut className="w-4 h-4" /> Logout
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 text-sm font-medium text-brand-purple hover:bg-brand-purple/5 rounded-full transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-purple to-brand-red hover:from-brand-red hover:to-brand-purple rounded-full shadow-lg shadow-brand-purple/20 transition-all hover:scale-105 active:scale-95"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden pb-3">
             <SearchBox
               value={searchQuery}
               onChange={setSearchQuery}
               onSearch={(q) => { const s = (q || "").trim(); if (s) router.push(`/?search=${encodeURIComponent(s)}`) }}
               placeholder="Search essentials..."
               className="shadow-none border-foreground/10 bg-foreground/5"
             />
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-background z-[70] md:hidden shadow-2xl overflow-y-auto border-r border-border/50"
            >
               <div className="flex flex-col h-full">
                 <div className="p-5 flex items-center justify-between border-b border-foreground/5">
                   <div className="flex items-center gap-3">
                     <div className="w-9 h-9 relative rounded-lg overflow-hidden shadow-sm">
                       <Image src="/logo/firgomart.png" alt="Logo" fill className="object-contain" />
                     </div>
                     <span className="font-bold text-lg tracking-tight">Firgomart</span>
                   </div>
                   <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
                     <X className="w-5 h-5" />
                   </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {isAuthenticated ? (
                      <div className="bg-gradient-to-br from-brand-purple/5 to-brand-red/5 p-4 rounded-2xl border border-brand-purple/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-purple to-brand-red p-[1px]">
                             <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                <span className="text-sm font-bold text-brand-purple">{initials}</span>
                             </div>
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold truncate">{user?.name}</p>
                            <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 bg-background rounded-xl text-xs font-medium shadow-sm border border-foreground/5">
                             Profile
                           </Link>
                           <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="text-center py-2 bg-background rounded-xl text-xs font-medium shadow-sm border border-foreground/5">
                             Orders
                           </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false) }}
                          className="py-3 text-sm font-medium text-brand-purple bg-brand-purple/5 rounded-xl border border-brand-purple/10"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false) }}
                          className="py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-purple to-brand-red rounded-xl shadow-lg shadow-brand-purple/20"
                        >
                          Register
                        </button>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="px-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Menu</p>
                      <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                        <Store className="w-5 h-5 opacity-70" /> Home
                      </Link>
                      <button onClick={() => { setMobileMenuOpen(false); setShowOffers(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                        <Gift className="w-5 h-5 opacity-70" /> Special Offers
                      </button>
                      <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                        <Heart className="w-5 h-5 opacity-70" /> Wishlist
                      </Link>
                      <Link href="/seller-registration" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                        <Store className="w-5 h-5 opacity-70" /> Sell on Firgomart
                      </Link>
                      <button 
                        onClick={() => { setShowCart(true); setMobileMenuOpen(false) }} 
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                      >
                         <div className="flex items-center gap-3">
                           <ShoppingCart className="w-5 h-5 opacity-70" /> Cart
                         </div>
                         {cartCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                      </button>
                    </div>
                    {isAuthenticated && (
                      <div className="pt-4 border-t border-foreground/5">
                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                          <LogOut className="w-5 h-5" /> Logout
                        </button>
                      </div>
                    )}
                 </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <OffersOverlay isOpen={showOffers} onClose={() => setShowOffers(false)} />
      <LoginModal
        isOpen={showLoginModal && !isAuthenticated}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
        onSwitchToForgot={handleSwitchToForgot}
      />
      <RegisterModal
        isOpen={showRegisterModal && !isAuthenticated}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgotModal && !isAuthenticated}
        onClose={() => setShowForgotModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <BottomNav 
        onCartClick={() => setShowCart(true)} 
        onLoginClick={() => setShowLoginModal(true)} 
      />
    </>
  )
}

export default Navbar

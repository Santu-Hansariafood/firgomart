"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, User, Truck } from "lucide-react"
import { useCart } from "@/context/CartContext/CartContext"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"

interface BottomNavProps {
  onCartClick: () => void
  onLoginClick: () => void
}

const BottomNav: React.FC<BottomNavProps> = ({ onCartClick, onLoginClick }) => {
  const pathname = usePathname()
  const { cartItems } = useCart()
  const { isAuthenticated } = useAuth()

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  )

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    {
      label: "Orders",
      icon: Truck,
      href: isAuthenticated ? "/orders" : null,
      action: !isAuthenticated ? onLoginClick : undefined,
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      action: onCartClick,
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      label: "Profile",
      icon: User,
      href: isAuthenticated ? "/profile" : null,
      action: !isAuthenticated ? onLoginClick : undefined,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-foreground/10 pb-safe md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = item.href ? pathname === item.href : false

          const iconContent = (
            <div className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-brand-purple" : "text-foreground/60"}`}>
              <div className="relative">
                <Icon
                  className={clsx(
                    "w-6 h-6 transition-all duration-300",
                    isActive ? "scale-110" : ""
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 -mt-0.5 w-8 h-1 rounded-b-full bg-brand-purple"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          )

          if (item.href) {
            return (
              <Link key={idx} href={item.href} className="flex-1 h-full flex items-center justify-center relative">
                {iconContent}
              </Link>
            )
          }

          return (
            <button key={idx} onClick={item.action} className="flex-1 h-full flex items-center justify-center relative">
              {iconContent}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, User, Truck, Heart } from "lucide-react"
import { useCart } from "@/context/CartContext/CartContext"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
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
      label: "Wishlist",
      icon: Heart,
      href: isAuthenticated ? "/wishlist" : null,
      action: !isAuthenticated ? onLoginClick : undefined,
    },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="relative mx-auto max-w-md bg-background/80 backdrop-blur-xl border-t border-foreground/10 rounded-t-2xl shadow-[0_-12px_30px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between h-16 px-2">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const isActive =
              item.href &&
              (pathname === item.href ||
                pathname.startsWith(item.href + "/"))

            const content = (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center justify-center w-14 h-14"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomNavActive"
                    className="absolute inset-0 rounded-xl bg-brand-purple/15"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                <div className="relative z-10">
                  <Icon
                    className={clsx(
                      "w-6 h-6 transition-all duration-300",
                      isActive
                        ? "text-brand-purple scale-110 -translate-y-0.5"
                        : "text-foreground/60"
                    )}
                  />

                  {item.badge && (
                    <motion.span
                      key={item.badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </div>

                <span
                  className={clsx(
                    "mt-1 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-brand-purple"
                      : "text-foreground/60"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            )

            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center justify-center flex-1"
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={idx}
                onClick={item.action}
                className="flex items-center justify-center flex-1"
              >
                {content}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BottomNav

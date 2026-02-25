import Link from "next/link"
import { Gift, Store, Sun, Moon, ShoppingCart, ShoppingBasket } from "lucide-react"
import UserMenu from "./UserMenu"
import { SellerInfo } from "@/hooks/useNavbar"

interface NavActionsProps {
  setShowOffers: (show: boolean) => void
  toggleTheme: () => void
  theme: "light" | "dark"
  setShowCart: (show: boolean) => void
  cartCount: number
  isAuthenticated: boolean
  user: any
  sellerInfo: SellerInfo | null
  initials: string
  showUserMenu: boolean
  setShowUserMenu: (show: boolean) => void
  handleLogout: () => void
  setShowLoginModal: (show: boolean) => void
  setShowRegisterModal: (show: boolean) => void
}

const NavActions = ({
  setShowOffers,
  toggleTheme,
  theme,
  setShowCart,
  cartCount,
  isAuthenticated,
  user,
  sellerInfo,
  initials,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  setShowLoginModal,
  setShowRegisterModal
}: NavActionsProps) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href="/special-offers"
        className="hidden md:flex items-center justify-center p-2 text-foreground/70 hover:text-brand-purple hover:bg-brand-purple/5 rounded-full transition-all"
        aria-label="Offers"
        title="Offers"
      >
        <Gift className="w-5 h-5" />
      </Link>
      <Link
        href="/grocery"
        className="hidden lg:flex items-center justify-center p-2 text-foreground/70 hover:text-brand-purple hover:bg-brand-purple/5 rounded-full transition-all"
        aria-label="Grocery"
        title="Grocery"
      >
        <ShoppingBasket className="w-5 h-5" />
      </Link>
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
        className="hidden md:flex relative p-2 text-foreground/80 hover:text-brand-purple hover:bg-foreground/5 rounded-full transition-colors group"
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
        <UserMenu
          user={user}
          sellerInfo={sellerInfo}
          initials={initials}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          handleLogout={handleLogout}
        />
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
  )
}

export default NavActions

import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { User, Truck, Heart, LogOut } from "lucide-react"
import { SellerInfo } from "@/hooks/useNavbar"

interface UserMenuProps {
  user: any
  sellerInfo: SellerInfo | null
  initials: string
  showUserMenu: boolean
  setShowUserMenu: (show: boolean) => void
  handleLogout: () => void
}

const UserMenu = ({
  user,
  sellerInfo,
  initials,
  showUserMenu,
  setShowUserMenu,
  handleLogout
}: UserMenuProps) => {
  return (
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
  )
}

export default UserMenu

import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Store, Gift, Heart, ShoppingCart, 
  LifeBuoy, Truck, ShieldCheck, RotateCcw, 
  FileText, MessageCircle, LogOut 
} from "lucide-react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  user: any
  initials: string
  cartCount: number
  setShowLoginModal: (show: boolean) => void
  setShowRegisterModal: (show: boolean) => void
  handleLogout: () => void
  setShowOffers: (show: boolean) => void
  setShowCart: (show: boolean) => void
}

const MobileMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  initials,
  cartCount,
  setShowLoginModal,
  setShowRegisterModal,
  handleLogout,
  setShowOffers,
  setShowCart
}: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-background z-[70] md:hidden shadow-2xl overflow-y-auto border-r border-border/50"
          >
             <div className="flex flex-col h-full">
               <div className="p-5 flex items-center justify-between border-b border-foreground/5">
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-10 relative">
                      <Image src="/logo/firgomart.png" alt="Logo" fill className="object-contain" />
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
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
                         <Link href="/profile" onClick={onClose} className="text-center py-2 bg-background rounded-xl text-xs font-medium shadow-sm border border-foreground/5">
                           Profile
                         </Link>
                         <Link href="/orders" onClick={onClose} className="text-center py-2 bg-background rounded-xl text-xs font-medium shadow-sm border border-foreground/5">
                           Orders
                         </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setShowLoginModal(true); onClose() }}
                        className="py-3 text-sm font-medium text-brand-purple bg-brand-purple/5 rounded-xl border border-brand-purple/10"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { setShowRegisterModal(true); onClose() }}
                        className="py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-purple to-brand-red rounded-xl shadow-lg shadow-brand-purple/20"
                      >
                        Register
                      </button>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Menu</p>
                    <Link 
                      href="/" 
                      onClick={() => {
                        onClose();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} 
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <Store className="w-5 h-5 opacity-70" /> Home
                    </Link>
                    <button onClick={() => { onClose(); setShowOffers(true) }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                      <Gift className="w-5 h-5 opacity-70" /> Special Offers
                    </button>
                    <Link href="/wishlist" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                      <Heart className="w-5 h-5 opacity-70" /> Wishlist
                    </Link>
                    <Link href="/seller-registration" onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors">
                      <Store className="w-5 h-5 opacity-70" /> Sell on Firgomart
                    </Link>
                    <button 
                      onClick={() => { setShowCart(true); onClose() }} 
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                       <div className="flex items-center gap-3">
                         <ShoppingCart className="w-5 h-5 opacity-70" /> Cart
                       </div>
                       {cartCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
                    </button>
                  </div>
                  
                  <div className="space-y-1 mt-4 pt-4 border-t border-foreground/5">
                    <p className="px-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Customer Service</p>
                    <Link 
                      href="/help"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <LifeBuoy className="w-5 h-5 opacity-70" /> Help Center
                    </Link>
                    <Link 
                      href="/track-order"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <Truck className="w-5 h-5 opacity-70" /> Track Order
                    </Link>
                    <Link 
                      href="/trust-safety"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <ShieldCheck className="w-5 h-5 opacity-70" /> Trust & Safety
                    </Link>
                    <Link 
                      href="/returns"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 opacity-70" /> Returns & Refunds
                    </Link>
                    <Link 
                      href="/shipping"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <FileText className="w-5 h-5 opacity-70" /> Shipping Info
                    </Link>
                    <Link 
                      href="/faq"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-foreground/5 rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 opacity-70" /> FAQs
                    </Link>
                  </div>
                  {isAuthenticated && (
                    <div className="pt-4 border-t border-foreground/5">
                      <button onClick={() => { handleLogout(); onClose() }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
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
  )
}

export default MobileMenu

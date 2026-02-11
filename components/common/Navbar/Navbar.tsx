"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { useNavbar } from "@/hooks/useNavbar"
import dynamic from "next/dynamic"
const PromoBanner = dynamic(() => import("./components/PromoBanner"))
const NavActions = dynamic(() => import("./components/NavActions"))
const MobileLocation = dynamic(() => import("./components/MobileLocation"))
const MobileMenu = dynamic(() => import("./components/MobileMenu"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const LoginModal = dynamic(() => import("@/components/auth/LoginModal/LoginModal"))
const RegisterModal = dynamic(() => import("@/components/auth/RegisterModal/RegisterModal"))
const ForgotPasswordModal = dynamic(() => import("@/components/auth/ForgotPasswordModal/ForgotPasswordModal"))
const LocationRequestModal = dynamic(() => import("@/components/common/LocationRequestModal/LocationRequestModal"), { ssr: false })
const OffersOverlay = dynamic(() => import("@/components/common/OffersOverlay/OffersOverlay"), { ssr: false })
const BottomNav = dynamic(() => import("@/components/common/BottomNav/BottomNav"))

const Navbar: React.FC = () => {
  const { state, actions } = useNavbar()
  
  const {
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
    deliverToState,
    fullLocation
  } = state

  const {
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
    handleRequestLocation,
    handleManualLocation
  } = actions

  return (
    <>
      <PromoBanner />
      <nav className="sticky top-0 z-50 bg-white dark:bg-background border-b border-[var(--foreground)/5] shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-1.5 -ml-1 text-foreground/80 hover:bg-foreground/5 rounded-full transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <Link 
                href="/" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex-shrink-0 relative w-12 h-12 min-[380px]:w-16 min-[380px]:h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 transition-transform hover:scale-105 active:scale-95"
              >
                <Image
                  src="/logo/firgomart.png"
                  alt="Firgomart"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 768px) 64px, 96px"
                />
              </Link>
            </div>

            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                placeholder="Search for products, brands and more..."
                enableSuggestions={true}
                className="transition-all duration-300"
              />
            </div>

            <NavActions
              setShowOffers={setShowOffers}
              toggleTheme={toggleTheme}
              theme={theme}
              setShowCart={setShowCart}
              cartCount={cartCount}
              isAuthenticated={isAuthenticated}
              user={user}
              sellerInfo={sellerInfo}
              initials={initials}
              showUserMenu={showUserMenu}
              setShowUserMenu={setShowUserMenu}
              handleLogout={handleLogout}
              setShowLoginModal={setShowLoginModal}
              setShowRegisterModal={setShowRegisterModal}
            />
          </div>
          <div className="md:hidden pb-3">
             <SearchBox
               value={searchQuery}
               onChange={setSearchQuery}
               onSearch={handleSearch}
               placeholder="Search essentials..."
               className="shadow-none border-foreground/10"
             />
          </div>
        </div>
        <MobileLocation
          isAuthenticated={isAuthenticated}
          locationLoading={locationLoading}
          deliverToState={deliverToState}
          fullLocation={fullLocation}
          setShowLocationModal={setShowLocationModal}
          setShowLoginModal={setShowLoginModal}
        />
      </nav>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        initials={initials}
        cartCount={cartCount}
        setShowLoginModal={setShowLoginModal}
        setShowRegisterModal={setShowRegisterModal}
        handleLogout={handleLogout}
        setShowOffers={setShowOffers}
        setShowCart={setShowCart}
      />

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
      <LocationRequestModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestLocation={handleRequestLocation}
        onManualLocation={handleManualLocation}
        loading={locationLoading}
      />
      <BottomNav 
        onCartClick={() => setShowCart(true)} 
        onLoginClick={() => setShowLoginModal(true)} 
      />
    </>
  )
}

export default Navbar

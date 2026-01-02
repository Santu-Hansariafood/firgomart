"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
const LoginModal = dynamic(() => import("@/components/auth/LoginModal/LoginModal"))
const RegisterModal = dynamic(() => import("@/components/auth/RegisterModal/RegisterModal"))
const ForgotPasswordModal = dynamic(() => import("@/components/auth/ForgotPasswordModal/ForgotPasswordModal"))

export default function LoginPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"
  const mode = searchParams.get("mode") || "login"
  const { status } = useSession()

  const [showLogin, setShowLogin] = useState(mode === "login")
  const [showRegister, setShowRegister] = useState(mode === "register")
  const [showForgot, setShowForgot] = useState(mode === "forgot")

  const handleClose = () => {
    if (status === "authenticated") router.push(next)
  }

  const switchToRegister = () => {
    setShowLogin(false)
    setShowForgot(false)
    setShowRegister(true)
  }

  const switchToLogin = () => {
    setShowRegister(false)
    setShowForgot(false)
    setShowLogin(true)
  }

  const switchToForgot = () => {
    setShowLogin(false)
    setShowRegister(false)
    setShowForgot(true)
  }

  useEffect(() => {
    if (status === "authenticated") router.push(next)
  }, [status, next, router])

  return (
    <Suspense fallback={<BeautifulLoader />}>
      <LoginModal
        isOpen={showLogin}
        onClose={handleClose}
        onSwitchToRegister={switchToRegister}
        onSwitchToForgot={switchToForgot}
      />
      <RegisterModal
        isOpen={showRegister}
        onClose={handleClose}
        onSwitchToLogin={switchToLogin}
      />
      <ForgotPasswordModal
        isOpen={showForgot}
        onClose={switchToLogin}
        onSwitchToLogin={switchToLogin}
      />
    </Suspense>
  )
}


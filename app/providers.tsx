'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext/CartContext'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
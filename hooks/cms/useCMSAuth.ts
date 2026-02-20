'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'

interface CMSAuthResult {
  authLoading: boolean
  allowed: boolean
}

export function useCMSAuth(): CMSAuthResult {
  const { user: authUser, loading: authLoading } = useAuth()

  const allowed = useMemo(() => {
    if (!authUser) return false
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
    const email = authUser.email?.toLowerCase() || ''
    const role = authUser.role
    return emails.includes(email) || role === 'admin'
  }, [authUser])

  return { authLoading, allowed }
}

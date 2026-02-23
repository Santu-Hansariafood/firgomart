import React from "react"
import type { Metadata } from "next"
import AdminIdleHandler from "@/components/admin/AdminIdleHandler"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminIdleHandler />
      {children}
    </>
  )
}

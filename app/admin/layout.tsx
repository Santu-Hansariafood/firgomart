import React from "react"
import AdminIdleHandler from "@/components/admin/AdminIdleHandler"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminIdleHandler />
      {children}
    </>
  )
}

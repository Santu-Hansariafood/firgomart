import React, { Suspense } from "react"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  )
}

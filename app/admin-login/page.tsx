import React, { Suspense } from "react"
import AdminLogin from "@/components/ui/AdminLogin/AdminLogin"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

export default function Page() {
  return (
    <Suspense fallback={<BeautifulLoader/>}>
      <AdminLogin />
    </Suspense>
  )
}

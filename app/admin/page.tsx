import React, { Suspense } from "react"
import AdminPageClient from "./AdminPageClient"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

export default function AdminPage() {
  return (
    <Suspense fallback={<BeautifulLoader/>}>
      <AdminPageClient />
    </Suspense>
  )
}


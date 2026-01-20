import dynamic from "next/dynamic"
import { Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

const Profile = dynamic(() => import("@/components/ui/Profile/Profile"));

const page = () => {
  return (
    <Suspense fallback={<BeautifulLoader />}>
      <Profile />
    </Suspense>
  )
}

export default page
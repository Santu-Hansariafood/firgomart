import Link from "next/link"

const PromoBanner = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-[10px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide z-[60] relative">
      <p className="flex items-center justify-center gap-2">
        <span>Get the best experience on our App!</span>
        <Link href="/download-app" className="underline hover:text-white/90 font-bold decoration-white/50 underline-offset-2">
          Download Now
        </Link>
      </p>
    </div>
  )
}

export default PromoBanner

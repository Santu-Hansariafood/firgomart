"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"

type Props = Omit<ImageProps, "src"> & { src?: string }

export default function FallbackImage({ src, alt, unoptimized, ...rest }: Props) {
  const sanitize = (v?: string) => (v || "").trim().replace(/[)]+$/g, "")
  const buildSrc = (v?: string) => {
    const s = sanitize(v)
    if (!s) return "/logo/firgomart.png"
    if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:") || s.startsWith("blob:")) {
      return s
    }
    return "/logo/firgomart.png"
  }
  const [cur, setCur] = useState(buildSrc(src))
  useEffect(() => {
    setCur(buildSrc(src))
  }, [src])
  const safeAlt = typeof alt === "string" ? alt : ""
  const needsSizes = (rest as any)?.fill && !(rest as { sizes?: string }).sizes
  const finalSizes = needsSizes ? "100vw" : (rest as { sizes?: string }).sizes
  return (
    <Image
      src={cur || "/logo/firgomart.png"}
      alt={safeAlt}
      onError={() => setCur("/logo/firgomart.png")}
      unoptimized={unoptimized ?? true}
      sizes={finalSizes}
      {...rest}
    />
  )
}

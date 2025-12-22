"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"

type Props = Omit<ImageProps, "src"> & { src?: string }

export default function FallbackImage({ src, alt, unoptimized, ...rest }: Props) {
  const sanitize = (v?: string) => (v || "").trim().replace(/[)]+$/g, "")
  const [cur, setCur] = useState(sanitize(src) || "/logo/firgomart.png")
  useEffect(() => {
    setCur(sanitize(src) || "/logo/firgomart.png")
  }, [src])
  return (
    <Image
      src={cur || "/logo/firgomart.png"}
      alt={alt}
      onError={() => setCur("/logo/firgomart.png")}
      unoptimized={unoptimized ?? true}
      {...rest}
    />
  )
}

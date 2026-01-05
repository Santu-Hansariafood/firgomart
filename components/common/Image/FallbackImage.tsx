"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"
import clsx from "clsx"

type Props = Omit<ImageProps, "src"> & { src?: string; frameless?: boolean }

export default function FallbackImage({ src, alt, unoptimized, frameless, ...rest }: Props) {
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
  const safeAlt = typeof alt === "string" ? alt : ""
  const needsSizes = (rest as Partial<ImageProps>)?.fill && !(rest as Partial<ImageProps>).sizes
  const finalSizes = needsSizes ? "100vw" : (rest as Partial<ImageProps>).sizes
  const combinedClassName = frameless
    ? (rest as { className?: string }).className
    : clsx("bg-[var(--background)] border border-[var(--foreground)/20]", (rest as { className?: string }).className)
  return (
    <Image
      key={buildSrc(src)}
      src={cur || "/logo/firgomart.png"}
      alt={safeAlt}
      onError={() => setCur("/logo/firgomart.png")}
      unoptimized={unoptimized ?? true}
      sizes={finalSizes}
      {...rest}
      className={combinedClassName}
    />
  )
}

"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"
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
  const safeSrc = buildSrc(src)
  const parseSizeFromUrl = (v?: string) => {
    const s = sanitize(v)
    const match = s.match(/(\d{1,4})x(\d{1,4})(?=[^0-9]*$)/)
    if (!match) return {}
    const w = parseInt(match[1], 10)
    const h = parseInt(match[2], 10)
    if (!Number.isFinite(w) || !Number.isFinite(h)) return {}
    return { width: w, height: h }
  }
  const [cur, setCur] = useState(safeSrc)
  useEffect(() => {
    setCur(safeSrc)
  }, [safeSrc])
  const safeAlt = typeof alt === "string" ? alt : ""
  const restProps = rest as Partial<ImageProps>
  const fromUrl = parseSizeFromUrl(cur)
  const finalSizes = restProps.sizes ?? "100vw"
  const isFill = !!restProps.fill

  let width = restProps.width
  let height = restProps.height

  if (!isFill) {
    if (width && !height) height = width
    if (height && !width) width = height
    if (!width && !height) {
      if (fromUrl.width && fromUrl.height) {
        width = fromUrl.width
        height = fromUrl.height
      } else {
        width = 100
        height = 100
      }
    }
  }

  const { className, ...restWithoutClass } = rest as { className?: string }
  const combinedClassName = frameless
    ? className
    : clsx("bg-[var(--background)] border border-[var(--foreground)/20]", className)
  return (
    <Image
      src={cur || "/logo/firgomart.png"}
      alt={safeAlt}
      onError={() => setCur("/logo/firgomart.png")}
      unoptimized={unoptimized ?? true}
      sizes={finalSizes}
      {...restWithoutClass}
      {...(isFill ? {} : { width, height })}
      className={combinedClassName}
    />
  )
}

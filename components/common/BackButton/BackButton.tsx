"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import clsx from "clsx"
import React from "react"

type BackButtonProps = {
  label?: string
  href?: string
  className?: string
}

const BackButton: React.FC<BackButtonProps> = ({ label = "Back", href, className }) => {
  const router = useRouter()
  const onClick = () => {
    if (href) router.push(href)
    else router.back()
  }
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--foreground)/20] bg-[var(--background)] hover:bg-[var(--background)/80] text-[var(--foreground)]",
        className
      )}
      onClick={onClick}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  )
}

export default BackButton


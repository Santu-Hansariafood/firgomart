'use client'

import React from 'react'
import clsx from 'clsx'

interface CommonInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
  type?: string
  required?: boolean
  className?: string
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  className
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-[var(--foreground)/70]">{label}</label>}

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full rounded-xl border border-[var(--foreground)/20] px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-[var(--background)] text-[color:var(--foreground)]",
          className
        )}
      />
    </div>
  )
}

export default CommonInput

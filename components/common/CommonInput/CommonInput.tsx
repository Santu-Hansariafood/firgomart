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
      {label && <label className="text-sm font-medium text-gray-600">{label}</label>}

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
      />
    </div>
  )
}

export default CommonInput

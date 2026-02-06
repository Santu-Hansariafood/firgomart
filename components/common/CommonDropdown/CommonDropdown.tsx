'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'

interface DropdownItem {
  id: string | number
  label: string
}

interface CommonDropdownProps {
  label?: string
  placeholder?: string
  options: DropdownItem[]
  selected: DropdownItem[] | DropdownItem | null
  onChange: (selected: DropdownItem | DropdownItem[]) => void
  multiple?: boolean
  className?: string
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  placeholder = "Search...",
  options,
  selected,
  onChange,
  multiple = false,
  className
}) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (item: DropdownItem) => {
    if (multiple) {
      const list = selected ? [...(selected as DropdownItem[])] : []
      const exists = list.find((i) => i.id === item.id)

      const newList = exists
        ? list.filter((i) => i.id !== item.id)
        : [...list, item]

      onChange(newList)
    } else {
      onChange(item)
      setOpen(false)
    }
  }

  const isSelected = (id: string | number) => {
    if (!selected) return false

    return multiple
      ? (selected as DropdownItem[]).some((i) => i.id === id)
      : (selected as DropdownItem)?.id === id
  }

  return (
    <div className={clsx("w-full relative", className)} ref={containerRef}>
      {label && <p className="text-sm mb-1 font-medium text-[var(--foreground)/70]">{label}</p>}
      <div
        className={clsx(
          "w-full rounded-lg border border-[var(--foreground)/20] flex flex-wrap gap-2 items-center justify-between px-4 py-2 cursor-pointer bg-[var(--background)] text-[color:var(--foreground)] transition-all duration-200 min-h-[42px]",
          open && "ring-2 ring-brand-purple border-brand-purple"
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-2 w-full">
          {multiple ? (
            (selected as DropdownItem[])?.length > 0 ? (
              (selected as DropdownItem[]).map((item) => (
                <span
                  key={item.id}
                  className="bg-brand-purple text-white px-2 py-1 rounded-lg flex items-center gap-1"
                >
                  {item.label}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(item)
                    }}
                  />
                </span>
              ))
            ) : (
              <span className="text-[var(--foreground)/50]">{placeholder}</span>
            )
          ) : selected ? (
            <span>{(selected as DropdownItem).label}</span>
          ) : (
            <span className="text-[var(--foreground)/50]">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} className={clsx("text-[var(--foreground)/50] transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--background)] border border-[var(--foreground)/20] rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[var(--foreground)/10]">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 bg-[var(--foreground)/5] rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand-purple"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "px-4 py-3 text-sm cursor-pointer hover:bg-[var(--foreground)/5] transition-colors",
                    isSelected(item.id) && "bg-brand-purple/10 text-brand-purple font-medium"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(item)
                  }}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--foreground)/50] text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CommonDropdown

'use client'

import { useState } from 'react'
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
    <div className={clsx("w-full relative", className)}>
      {label && <p className="text-sm mb-1 font-medium text-gray-600">{label}</p>}

      {/* Selected box */}
      <div
        className={clsx(
          "rounded-xl border flex flex-wrap gap-2 items-center justify-between px-4 py-3 cursor-pointer bg-white",
          open && "ring-2 ring-blue-500"
        )}
        onClick={() => setOpen(!open)}
      >
        {/* Selected items */}
        <div className="flex flex-wrap gap-2 w-full">
          {multiple ? (
            (selected as DropdownItem[])?.length > 0 ? (
              (selected as DropdownItem[]).map((item) => (
                <span
                  key={item.id}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1"
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
              <span className="text-gray-400">{placeholder}</span>
            )
          ) : selected ? (
            <span>{(selected as DropdownItem).label}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          size={20}
          className={clsx(
            "transition ml-auto",
            open && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute left-0 right-0 mt-2 border rounded-xl bg-white shadow-lg max-h-64 overflow-auto z-50 p-2">
          {/* Search Input */}
          <input
            className="w-full border px-3 py-2 rounded-lg mb-2 outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Options */}
          {filteredOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={clsx(
                "px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-100",
                isSelected(item.id) && "bg-blue-200"
              )}
            >
              {item.label}
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <p className="text-center text-gray-400 py-2">No results found</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CommonDropdown

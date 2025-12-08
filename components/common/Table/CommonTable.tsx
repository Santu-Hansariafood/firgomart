"use client"

import React from "react"
import clsx from "clsx"
import { ChevronUp, ChevronDown } from "lucide-react"

type Column<T> = {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  width?: string | number
}

type CommonTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  sortKey?: string | null
  sortOrder?: "asc" | "desc"
  onSortChange?: (key: string, order: "asc" | "desc") => void
  rowKey?: (row: T, index: number) => string | number
  className?: string
}

function CommonTable<T extends Record<string, any>>({
  columns,
  data,
  sortKey,
  sortOrder = "asc",
  onSortChange,
  rowKey,
  className,
}: CommonTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSortChange) return
    const nextOrder = sortKey === key ? (sortOrder === "asc" ? "desc" : "asc") : "asc"
    onSortChange(key, nextOrder)
  }

  return (
    <div className={clsx("w-full overflow-x-auto rounded-xl border bg-white", className)}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map((col) => {
              const active = sortKey === String(col.key)
              return (
                <th
                  key={String(col.key)}
                  className={clsx(
                    "text-left px-4 py-3 font-medium text-gray-700 whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      active ? (
                        sortOrder === "asc" ? (
                          <ChevronUp size={14} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-500" />
                        )
                      ) : (
                        <span className="inline-flex">
                          <ChevronUp size={14} className="text-gray-300 -mr-1" />
                          <ChevronDown size={14} className="text-gray-300 -ml-1" />
                        </span>
                      )
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={columns.length}>
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={rowKey ? rowKey(row, idx) : idx} className={clsx(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}> 
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-gray-900 whitespace-nowrap">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CommonTable


"use client"

import React from "react"
import clsx from "clsx"

type CommonPaginationProps = {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  className?: string
}

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i)

const CommonPagination: React.FC<CommonPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const maxButtons = 7
  const start = Math.max(1, currentPage - Math.floor(maxButtons / 2))
  const end = Math.min(totalPages, start + maxButtons - 1)
  const pages = range(start, end)

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <button
        className={clsx(
          "px-3 py-1 rounded border",
          currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
        )}
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Prev
      </button>
      {start > 1 && (
        <>
          <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="px-2 text-gray-500">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={clsx(
            "px-3 py-1 rounded border",
            p === currentPage ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
          )}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-500">…</span>}
          <button className="px-3 py-1 rounded border bg-white hover:bg-gray-50" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      <button
        className={clsx(
          "px-3 py-1 rounded border",
          currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
        )}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </button>
      <span className="ml-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
    </div>
  )
}

export default CommonPagination


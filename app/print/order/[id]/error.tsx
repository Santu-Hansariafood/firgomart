"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-left overflow-auto max-h-60">
        <p className="font-mono text-sm text-red-800">{error.message}</p>
        {error.stack && (
            <pre className="text-xs text-red-600 mt-2">{error.stack}</pre>
        )}
      </div>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-brand-purple text-white rounded hover:bg-brand-purple/90"
      >
        Try again
      </button>
    </div>
  )
}

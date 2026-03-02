import { useEffect, useState } from "react"

export type DropdownItem = { id: string | number; label: string }

export function useProductIdOptions(args: {
  session: any
  authUser: any
  products: Array<{ id: string; name: string; productId?: string }>
  isModalOpen: boolean
}) {
  const { session, authUser, products, isModalOpen } = args
  const [productIdOptions, setProductIdOptions] = useState<DropdownItem[]>([])

  useEffect(() => {
    if (!isModalOpen) return
    const adminEmail = (session?.user?.email || authUser?.email || "").trim()
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/products?limit=1000&sortBy=name&sortOrder=asc`, {
          headers: { ...(adminEmail ? { "x-admin-email": adminEmail } : {}) }
        })
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data.products) ? data.products : []
          const opts: DropdownItem[] = list.map((p: any) => {
            const pid = String(p.productId || p.id)
            const badge = p.productId ? "PID" : "ID"
            return { id: pid, label: `${badge}: ${pid} — ${p.name}` }
          })
          setProductIdOptions(opts)
        } else {
          const fallback: DropdownItem[] = products.map((p) => {
            const pid = String(p.productId || p.id)
            const badge = p.productId ? "PID" : "ID"
            return { id: pid, label: `${badge}: ${pid} — ${p.name}` }
          })
          setProductIdOptions(fallback)
        }
      } catch {
        const fallback: DropdownItem[] = products.map((p) => {
          const pid = String(p.productId || p.id)
          const badge = p.productId ? "PID" : "ID"
          return { id: pid, label: `${badge}: ${pid} — ${p.name}` }
        })
        setProductIdOptions(fallback)
      }
    })()
  }, [isModalOpen, session, authUser, products])

  return { productIdOptions }
}

import { useCallback, useEffect } from "react"

export type DropdownItem = { id: string | number; label: string }

type ProductItem = {
  id: string
  name: string
  category?: string
  subcategory?: string
  price: number
  currencyCode?: string
  originalPrice?: number
  stock?: number
  sellerState?: string
  sellerHasGST?: boolean
  createdByEmail?: string
  createdAt?: string
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  description?: string
  image?: string
  images?: string[]
  height?: number
  width?: number
  length?: number
  weight?: number
  dimensionUnit?: string
  lengthUnit?: string
  weightUnit?: string
  hsnCode?: string
  gstNumber?: string
  productId?: string
  availableCountry?: string
  deliveryTimeDays?: number
}

export function useAdminProductsLoader(args: {
  session: any
  authUser: any
  allowed: boolean
  page: number
  pageSize: number
  category: string
  selectedState: DropdownItem | null
  selectedGST: DropdownItem
  search: string
  sortKey: string | null
  sortOrder: "asc" | "desc"
  setProducts: (value: ProductItem[]) => void
  setTotal: (value: number) => void
  setLoading: (value: boolean) => void
}) {
  const {
    session,
    authUser,
    allowed,
    page,
    pageSize,
    category,
    selectedState,
    selectedGST,
    search,
    sortKey,
    sortOrder,
    setProducts,
    setTotal,
    setLoading
  } = args

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (category) params.set("category", category)
      if (selectedState?.id && String(selectedGST.id) !== "true") params.set("state", String(selectedState.id))
      if (selectedGST?.id !== undefined && selectedGST.id !== "") params.set("hasGST", String(selectedGST.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: { ...(adminEmail ? { "x-admin-email": adminEmail } : {}) }
      })
      const data = await res.json()
      if (res.ok) {
        setProducts(Array.isArray(data.products) ? data.products : [])
        setTotal(Number(data.total || 0))
      } else {
        setProducts([])
        setTotal(0)
      }
    } catch {
      setProducts([])
      setTotal(0)
    }
    setLoading(false)
  }, [
    session,
    authUser,
    page,
    pageSize,
    category,
    selectedState,
    selectedGST,
    search,
    sortKey,
    sortOrder,
    setProducts,
    setTotal,
    setLoading
  ])

  useEffect(() => {
    if (!allowed) return
    loadProducts()
  }, [allowed, loadProducts])

  return { loadProducts }
}

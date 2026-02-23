export interface Product {
  id: string | number
  _id?: string | number
  name: string
  image: string
  images?: string[]
  category: string
  subcategory?: string
  price: number
  currencyCode?: string
  originalPrice?: number
  discount?: number
  rating?: number
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  description?: string
  reviews?: number
  stock?: number
  unitsPerPack?: number
  availableCountry?: string
  deliveryTimeDays?: number
  isAdminProduct?: boolean
  isComboPack?: boolean
  comboItems?: {
    productId: string
    quantity: number
  }[]
  hsnCode?: string
  weight?: string | number
  weightUnit?: string
  height?: string | number
  width?: string | number
  dimensionUnit?: string
  appliedOffer?: {
    name: string
    type: string
    value?: string | number
  }
}

export type DropdownItem = {
  id: string | number
  label: string
}

export interface CartItem {
  id: number | string
  name: string
  price: number
  image: string
  originalPrice?: number
  quantity?: number
  stock?: number
  unitsPerPack?: number
  selectedSize?: string
  selectedColor?: string
  _uniqueId?: string
  appliedOffer?: {
    name: string
    type: string
    value?: string | number
  }
}

export interface CheckoutFormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

export interface SummaryItem {
  productId: string
  gstPercent: number
  gstAmount: number
  cgst: number
  sgst: number
  igst: number
  stock: number
}

export interface OrderSummary {
  subtotal: number
  tax: number
  total: number
  items: SummaryItem[]
  taxBreakdown: {
    cgst: number
    sgst: number
    igst: number
  }
}

export async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    try {
      const t = await res.text()
      return { errorText: t }
    } catch {
      return {}
    }
  }
}

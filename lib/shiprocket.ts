
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getSellerModel, findSellerAcrossDBs } from "@/lib/models/Seller"

function getShiprocketBaseUrl() {
  const raw = process.env.SHIPROCKET_BASE_URL || ""
  const trimmed = raw.trim()
  if (trimmed) return trimmed.replace(/\/+$/, "")
  return "https://apiv2.shiprocket.in"
}

export function hasShiprocketCredentials() {
  const token = process.env.SHIPROCKET_TOKEN || ""
  if (token.trim()) return true
  
  const email = process.env.SHIPROCKET_EMAIL || ""
  const password = process.env.SHIPROCKET_PASSWORD || ""
  return !!email.trim() && !!password.trim()
}

export async function getShiprocketToken() {
  const envToken = (process.env.SHIPROCKET_TOKEN || "").trim()
  if (envToken) {
    return envToken
  }

  const email = (process.env.SHIPROCKET_EMAIL || "").trim()
  const password = (process.env.SHIPROCKET_PASSWORD || "").trim()
  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured")
  }
  const base = getShiprocketBaseUrl()
  const res = await fetch(`${base}/v1/external/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    let message = "Shiprocket auth failed"
    try {
      const data = await res.json()
      message = data?.message || data?.error || message
    } catch {
    }
    throw new Error(`[${res.status}] ${message}`)
  }
  const data = await res.json()
  const token = data?.token
  if (!token || typeof token !== "string") {
    throw new Error("Shiprocket auth token missing")
  }
  return token
}

async function generateInvoice(token: string, orderId: string | number) {
  const base = getShiprocketBaseUrl()
  try {
    const res = await fetch(`${base}/v1/external/orders/print/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: [orderId] }),
    })
    if (res.ok) {
       const data = await res.json()
       return data.invoice_url || null
    }
  } catch {}
  return null
}

async function getOrCreatePickupLocation(token: string, seller: any) {
  if (!seller) return process.env.SHIPROCKET_PICKUP_LOCATION || "Default"
  
  const pickupCode = `Seller_${seller._id}`
  const base = getShiprocketBaseUrl()

  const payload = {
    pickup_location: pickupCode,
    name: seller.businessName || seller.ownerName || "Seller",
    email: seller.email,
    phone: seller.phone,
    address: seller.address || "Seller Address",
    address_2: "",
    city: seller.city || "City",
    state: seller.state || "State",
    country: seller.country || "India",
    pin_code: seller.pincode || "000000",
  }

  const res = await fetch(`${base}/v1/external/settings/company/addpickup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
  
  if (res.ok) {
    return pickupCode
  }

  const data = await res.json()
  if (data?.success === false || data?.message_code === "ALL_PICKUP_LOCATIONS_EXISTS" || JSON.stringify(data).toLowerCase().includes("exists")) {
    return pickupCode
  }
  
  console.error("Failed to create Shiprocket pickup location for seller", seller.email, data)
  return process.env.SHIPROCKET_PICKUP_LOCATION || "Default"
}

function buildShiprocketOrderPayload(order: any, items: any[], pickupLocation: string) {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  const orderDate = `${yyyy}-${mm}-${dd} ${hh}:${mi}`

  const buyerName = String(order.buyerName || "FirgoMart Customer")
  const buyerEmail = String(order.buyerEmail || "")
  const billingAddress = String(order.address || "")
  const billingCity = String(order.city || "")
  const billingState = String(order.state || "")
  const billingCountry = String(order.country || "India")
  const billingPincode = String((order as any).pincode || process.env.SHIPROCKET_DEFAULT_PINCODE || "110001") 
  const billingPhone = String((order as any).phone || (order as any).buyerPhone || process.env.SHIPROCKET_DEFAULT_PHONE || "9999999999")

  const orderItems = items.map((it: any) => ({
    name: String(it.name || "Item"),
    sku: String(it.productId || it.name || "SKU"),
    units: Number(it.quantity || 1),
    selling_price: Number(it.price || 0),
  }))

  const subTotal = orderItems.reduce((s: number, it: any) => s + Number(it.selling_price || 0) * Number(it.units || 1), 0)

  const length = Number(process.env.SHIPROCKET_DEFAULT_LENGTH || 10)
  const breadth = Number(process.env.SHIPROCKET_DEFAULT_BREADTH || 10)
  const height = Number(process.env.SHIPROCKET_DEFAULT_HEIGHT || 10)
  const weight = Number(process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5)

  const idSource = order.orderNumber || order._id
  const orderId = String(idSource || "") + (items.length !== (order.items || []).length ? `-${pickupLocation}` : "")

  return {
    order_id: orderId,
    order_date: orderDate,
    pickup_location: pickupLocation,
    billing_customer_name: buyerName,
    billing_last_name: "",
    billing_address: billingAddress,
    billing_city: billingCity,
    billing_pincode: billingPincode,
    billing_state: billingState,
    billing_country: billingCountry,
    billing_email: buyerEmail,
    billing_phone: billingPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    sub_total: subTotal,
    length: (order as any).length || Number(process.env.SHIPROCKET_DEFAULT_LENGTH || 10),
    breadth: (order as any).breadth || Number(process.env.SHIPROCKET_DEFAULT_BREADTH || 10),
    height: (order as any).height || Number(process.env.SHIPROCKET_DEFAULT_HEIGHT || 10),
    weight: (order as any).weight || Number(process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5),
  }
}

export async function createShiprocketShipment(order: any, targetSellerEmail?: string) {
  const token = await getShiprocketToken()
  const base = getShiprocketBaseUrl()
  
  const conn = await connectDB()
  const Product = getProductModel(conn)
  const items = Array.isArray(order.items) ? order.items : []
  const productIds = items.map((it: any) => it.productId)
  
  const products = await (Product as any).find({ _id: { $in: productIds } }).lean()
  const productMap = new Map<string, any>(products.map((p: any) => [String(p._id), p]))
  
  const sellerGroups: Record<string, any[]> = {}
  
  for (const it of items) {
    const p = productMap.get(String(it.productId))
    const sellerEmail = p?.createdByEmail || "ADMIN"
    if (targetSellerEmail && sellerEmail !== targetSellerEmail) continue
    
    if (!sellerGroups[sellerEmail]) sellerGroups[sellerEmail] = []
    sellerGroups[sellerEmail].push(it)
  }
  
  const shipments = []

  for (const [sellerEmail, groupItems] of Object.entries(sellerGroups)) {
    let pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Default"
    
    // Calculate weight and dimensions for this group
    let totalWeight = 0
    let maxL = 10, maxB = 10, maxH = 10

    for (const item of groupItems) {
      const p = productMap.get(String(item.productId))
      if (p) {
        // Weight conversion to KG
        let w = Number(p.weight || 0)
        const wUnit = String(p.weightUnit || "kg").toLowerCase().trim()
        if (wUnit === "g") w = w / 1000
        if (wUnit === "mg") w = w / 1000000
        totalWeight += (w * (item.quantity || 1))

        // Dims conversion to CM (simplified: take max of any item as box size)
        const toCm = (v: number, u: string) => {
          const unit = u.toLowerCase().trim()
          if (unit === "m") return v * 100
          if (unit === "mm") return v / 10
          if (unit === "in") return v * 2.54
          if (unit === "ft") return v * 30.48
          return v
        }
        const dUnit = String(p.dimensionUnit || "cm")
        const l = toCm(Number(p.length || p.depth || 10), dUnit) // fallback to depth/10 if length missing
        const b = toCm(Number(p.width || 10), dUnit)
        const h = toCm(Number(p.height || 10), dUnit)
        
        maxL = Math.max(maxL, l)
        maxB = Math.max(maxB, b)
        maxH = Math.max(maxH, h)
      }
    }
    
    // Ensure minimums
    totalWeight = Math.max(totalWeight, 0.5)

    if (sellerEmail !== "ADMIN") {
      const Seller = getSellerModel(conn)
      let seller = await (Seller as any).findOne({ email: sellerEmail }).lean()
      if (!seller) {
        const found = await findSellerAcrossDBs({ email: sellerEmail })
        if (found) seller = found.seller
      }
      if (seller) {
        pickupLocation = await getOrCreatePickupLocation(token, seller)
      }
    }
    
    // Pass calculated metrics via order object override
    const payload = buildShiprocketOrderPayload(
      { ...order, weight: totalWeight, length: maxL, breadth: maxB, height: maxH }, 
      groupItems, 
      pickupLocation
    )
    
    try {
      const createRes = await fetch(`${base}/v1/external/orders/create/adhoc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      if (!createRes.ok) {
        let message = "Shiprocket order creation failed"
        try {
           const d = await createRes.json()
           message = d?.message || d?.error || message
        } catch {}
        console.error("Shiprocket create failed for seller", sellerEmail, message)
        continue 
      }
      
      const created = await createRes.json()
      const shipmentId = created?.shipment_id || created?.shipmentId
      const srOrderId = created?.order_id || created?.orderId
      if (!shipmentId) continue

      const awbPayload: any = { shipment_id: shipmentId }
      const courierIdRaw = process.env.SHIPROCKET_COURIER_ID
      if (courierIdRaw) {
        const n = Number(courierIdRaw)
        if (!Number.isNaN(n) && n > 0) awbPayload.courier_id = n
      }

      const awbRes = await fetch(`${base}/v1/external/courier/assign/awb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(awbPayload),
      })
      
      if (awbRes.ok) {
         const awbData = await awbRes.json()
         const awbCode = awbData?.awb_code || awbData?.awbCode
         const courierName = awbData?.courier_name || awbData?.courierName || ""
         
         let invoiceUrl = null
         if (srOrderId) {
           invoiceUrl = await generateInvoice(token, srOrderId)
         }

         if (awbCode) {
           shipments.push({
             trackingNumber: String(awbCode),
             courier: courierName ? String(courierName) : "Shiprocket",
             shipmentId: shipmentId,
             items: groupItems,
             sellerEmail,
             invoiceUrl,
           })
         }
      } else {
        console.error("AWB assignment failed", await awbRes.text())
      }
    } catch (e) {
      console.error("Shipment processing error", e)
    }
  }
  
  return shipments
}

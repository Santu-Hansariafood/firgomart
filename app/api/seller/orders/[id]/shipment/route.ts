import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getShipmentModel } from "@/lib/models/Shipment"

function getShiprocketBaseUrl() {
  const raw = process.env.SHIPROCKET_BASE_URL || ""
  const trimmed = raw.trim()
  if (trimmed) return trimmed.replace(/\/+$/, "")
  return "https://apiv2.shiprocket.in"
}

function hasShiprocketCredentials() {
  const email = process.env.SHIPROCKET_EMAIL || ""
  const password = process.env.SHIPROCKET_PASSWORD || ""
  return !!email.trim() && !!password.trim()
}

async function getShiprocketToken() {
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

function buildShiprocketOrderPayload(order: any) {
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
  const billingPincode = String(process.env.SHIPROCKET_DEFAULT_PINCODE || "")
  const billingPhone = String(process.env.SHIPROCKET_DEFAULT_PHONE || "")
  const pickupLocation = String(process.env.SHIPROCKET_PICKUP_LOCATION || "Default")

  const itemsRaw = Array.isArray(order.items) ? order.items : []
  const orderItems = itemsRaw.map((it: any) => ({
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
  const orderId = String(idSource || "")

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
    length,
    breadth,
    height,
    weight,
  }
}

async function createShiprocketShipment(order: any) {
  const token = await getShiprocketToken()
  const base = getShiprocketBaseUrl()
  const payload = buildShiprocketOrderPayload(order)

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
      const data = await createRes.json()
      message = data?.message || data?.error || message
    } catch {
    }
    throw new Error(`[${createRes.status}] ${message}`)
  }
  const created = await createRes.json()
  const shipmentId = created?.shipment_id || created?.shipmentId
  if (!shipmentId) {
    throw new Error("Shiprocket shipment id missing")
  }

  const awbPayload: any = { shipment_id: shipmentId }
  const courierIdRaw = process.env.SHIPROCKET_COURIER_ID
  if (courierIdRaw) {
    const n = Number(courierIdRaw)
    if (!Number.isNaN(n) && n > 0) {
      awbPayload.courier_id = n
    }
  }

  const awbRes = await fetch(`${base}/v1/external/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(awbPayload),
  })
  if (!awbRes.ok) {
    let message = "Shiprocket AWB assignment failed"
    try {
      const data = await awbRes.json()
      message = data?.message || data?.error || message
    } catch {
    }
    throw new Error(`[${awbRes.status}] ${message}`)
  }
  const awbData = await awbRes.json()
  const awbCode = awbData?.awb_code || awbData?.awbCode
  if (!awbCode) {
    throw new Error("Shiprocket AWB code missing")
  }
  const courierName =
    awbData?.courier_name ||
    awbData?.courierName ||
    awbData?.courier_company_name ||
    (awbData?.courier_company_id ? String(awbData.courier_company_id) : "")

  return {
    trackingNumber: String(awbCode),
    courier: courierName ? String(courierName) : "",
  }
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    let trackingNumber = String(body?.trackingNumber || "").trim()
    let courier = String(body?.courier || "").trim()
    const sellerEmail = String(body?.sellerEmail || "").trim()
    if (!sellerEmail) {
      return NextResponse.json({ error: "sellerEmail required" }, { status: 400 })
    }

    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Product = getProductModel(conn)
    const Shipment = getShipmentModel(conn)

    const order = await (Order as any).findById(id).lean()
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const sellerProducts = await (Product as any).find({ createdByEmail: sellerEmail }).select({ _id: 1 }).lean()
    const productIds = sellerProducts.map((p: any) => String(p._id))
    const hasSellerItem = (order.items || []).some((it: any) => productIds.includes(String(it.productId)))
    if (!hasSellerItem) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const useShiprocket = hasShiprocketCredentials() && (!trackingNumber || !courier)

    if (useShiprocket) {
      try {
        const created = await createShiprocketShipment(order)
        trackingNumber = created.trackingNumber
        courier = created.courier
      } catch (err: any) {
        const msg = err?.message || "Shiprocket error"
        return NextResponse.json({ error: "Failed to create Shiprocket shipment", reason: msg }, { status: 502 })
      }
    }

    if (!trackingNumber) {
      return NextResponse.json({ error: "trackingNumber required" }, { status: 400 })
    }

    let shipment = await (Shipment as any).findOne({ orderId: id }).lean()
    if (!shipment) {
      const now = new Date()
      shipment = await (Shipment as any).create({
        orderId: id,
        orderNumber: order.orderNumber,
        trackingNumber,
        courier,
        status: "shipped",
        origin: order.city || order.state,
        destination: order.city || order.state,
        lastUpdate: now,
        events: [{ time: now, status: "shipped", location: order.city || order.state, note: "Shipment created" }],
      })
    } else {
      const updated = await (Shipment as any).findByIdAndUpdate(
        shipment._id,
        {
          trackingNumber,
          courier,
          status: "shipped",
          lastUpdate: new Date(),
        },
        { new: true }
      ).lean()
      shipment = updated
    }

    const updatedOrder = await (Order as any).findByIdAndUpdate(id, { status: "shipped" }, { new: true }).lean()
    return NextResponse.json({ shipment, order: updatedOrder })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

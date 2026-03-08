import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getShipmentModel } from "@/lib/models/Shipment"
import {
  getShiprocketToken,
  checkServiceability,
  createShiprocketShipment,
  requestPickup,
  generateManifest,
  printManifest,
  generateLabel,
  generateInvoice,
  trackShipment,
  addPickupLocation,
} from "@/lib/shiprocket"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

function getShiprocketBaseUrl() {
  const raw = process.env.SHIPROCKET_BASE_URL || ""
  const trimmed = raw.trim()
  if (trimmed) return trimmed.replace(/\/+$/, "")
  return "https://apiv2.shiprocket.in"
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Allow admins or sellers (if we want sellers to ship their own?)
    // For now, let's assume strict admin control or allow if user is seller
    const user = session.user as { name?: string | null; email?: string | null; image?: string | null; role?: string }
    const isSeller = user.role === "seller"
    const isAdmin = isAdminEmail(user.email)
    
    if (!isAdmin && !isSeller) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...params } = body

    const token = await getShiprocketToken()
    const conn = await connectDB()
    const Shipment = getShipmentModel(conn)

    if (action === "test_connection") {
      // If we got here, getShiprocketToken() already succeeded
      return NextResponse.json({ success: true, message: "Connection successful! Token retrieved." })
    }

    if (action === "serviceability") {
      const { pickup_postcode, delivery_postcode, weight, cod } = params
      const data = await checkServiceability(token, { pickup_postcode, delivery_postcode, weight, cod })
      return NextResponse.json(data)
    }

    if (action === "create_manual_order") {
      const delivery = params.delivery || {}
      const billing = params.billing || {}
      const billingSameAsDelivery = !!params.billingSameAsDelivery
      const product = params.product || {}
      const charges = params.charges || {}
      const pkg = params.package || {}
      const other = params.other || {}

      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")
      const hh = String(now.getHours()).padStart(2, "0")
      const mi = String(now.getMinutes()).padStart(2, "0")

      const orderDate = other.orderDate || `${yyyy}-${mm}-${dd} ${hh}:${mi}`
      const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || "Default"

      const dName = String(delivery.fullName || "").trim()
      const dPhone = String(delivery.mobile || "").trim()
      const dAddress = String(delivery.address || "").trim()
      const dLandmark = String(delivery.landmark || "").trim()
      const dPincode = String(delivery.pincode || "").trim()
      const dCity = String(delivery.city || "").trim()
      const dState = String(delivery.state || "").trim()
      const dAlt = String(delivery.altMobile || "").trim()

      const bName = String((billingSameAsDelivery ? dName : billing.fullName || "") || "").trim()
      const bPhone = String((billingSameAsDelivery ? dPhone : billing.mobile || "") || "").trim()
      const bAddress = String((billingSameAsDelivery ? dAddress : billing.address || "") || "").trim()
      const bLandmark = String((billingSameAsDelivery ? dLandmark : billing.landmark || "") || "").trim()
      const bPincode = String((billingSameAsDelivery ? dPincode : billing.pincode || "") || "").trim()
      const bCity = String((billingSameAsDelivery ? dCity : billing.city || "") || "").trim()
      const bState = String((billingSameAsDelivery ? dState : billing.state || "") || "").trim()

      const email = String(params.email || delivery.email || billing.email || "").trim()

      const itemName = String(product.name || "").trim()
      const sku = String(product.sku || itemName || "SKU").trim()
      const quantity = Number(product.quantity || 1)
      const unitPrice = Number(product.unitPrice || 0)

      if (!itemName || !quantity || !unitPrice || !dAddress || !dCity || !dPincode || !dState) {
        return NextResponse.json({ error: "Missing required fields for Shiprocket order" }, { status: 400 })
      }

      const paymentMethod = String(charges.paymentMethod || "Prepaid")

      const subTotal = unitPrice * quantity
      const shippingCharges = Number(charges.shipping || 0)
      const giftWrapCharges = Number(charges.giftWrap || 0)
      const txCharges = Number(charges.transaction || 0)
      const totalDiscount = Number(charges.totalDiscount || 0) + Number(product.productDiscount || 0)

      const length = Number(pkg.length || process.env.SHIPROCKET_DEFAULT_LENGTH || 10)
      const height = Number(pkg.height || process.env.SHIPROCKET_DEFAULT_HEIGHT || 10)
      const breadth = Number(pkg.breadth || process.env.SHIPROCKET_DEFAULT_BREADTH || length)
      const deadWeight = Number(pkg.deadWeight || process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5)
      const weight = deadWeight > 0 ? deadWeight : Number(pkg.volumetricWeight || process.env.SHIPROCKET_DEFAULT_WEIGHT || 0.5)

      const idSource = other.orderId || `${yyyy}${mm}${dd}${hh}${mi}`
      const orderId = String(idSource || "").trim()

      const base = getShiprocketBaseUrl()

      const payload: any = {
        order_id: orderId,
        order_date: orderDate,
        pickup_location: pickupLocation,
        channel_id: "",
        comment: String(other.notes || ""),
        billing_customer_name: bName || dName,
        billing_last_name: "",
        billing_address: `${bAddress}${bLandmark ? ", " + bLandmark : ""}`,
        billing_city: bCity || dCity,
        billing_pincode: bPincode || dPincode,
        billing_state: bState || dState,
        billing_country: "India",
        billing_email: email || undefined,
        billing_phone: bPhone || dPhone,
        shipping_is_billing: billingSameAsDelivery,
        shipping_customer_name: dName,
        shipping_last_name: "",
        shipping_address: `${dAddress}${dLandmark ? ", " + dLandmark : ""}`,
        shipping_city: dCity,
        shipping_pincode: dPincode,
        shipping_state: dState,
        shipping_country: "India",
        shipping_email: email || undefined,
        shipping_phone: dPhone,
        order_items: [
          {
            name: itemName,
            sku,
            units: quantity,
            selling_price: unitPrice,
            discount: Number(product.productDiscount || 0),
            tax: Number(product.taxRate || 0),
            hsn: String(product.hsnCode || ""),
          },
        ],
        payment_method: paymentMethod,
        shipping_charges: shippingCharges,
        giftwrap_charges: giftWrapCharges,
        transaction_charges: txCharges,
        total_discount: totalDiscount,
        sub_total: subTotal,
        length,
        breadth,
        height,
        weight,
        order_tags: String(other.orderTag || ""),
      }

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
        return NextResponse.json({ error: message }, { status: 502 })
      }

      const created = await createRes.json()
      const shipmentId = created?.shipment_id || created?.shipmentId
      const srOrderId = created?.order_id || created?.orderId || orderId

      if (!shipmentId) {
        return NextResponse.json({ error: "Shiprocket shipment ID missing" }, { status: 502 })
      }

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

      if (!awbRes.ok) {
        const txt = await awbRes.text().catch(() => "")
        return NextResponse.json({ error: "AWB assignment failed", details: txt }, { status: 502 })
      }

      const awbData = await awbRes.json()
      const awbCode = awbData?.awb_code || awbData?.awbCode
      const courierName = awbData?.courier_name || awbData?.courierName || ""

      let invoiceUrl: string | null = null
      if (srOrderId) {
        invoiceUrl = await generateInvoice(token, srOrderId)
      }

      let labelUrl: string | null = null
      if (shipmentId) {
        const l = await generateLabel(token, shipmentId).catch(() => ({}))
        labelUrl = (l as any)?.label_url || (l as any)?.label_created_at || null
      }

      return NextResponse.json({
        success: true,
        shipmentId,
        shiprocketOrderId: srOrderId,
        awbCode,
        courier: courierName,
        invoiceUrl,
        labelUrl,
      })
    }

    if (action === "create_order") {
      const { orderId } = params
      const Order = getOrderModel(conn)
      const order = await (Order as any).findById(orderId).lean()
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

      // If seller, ensure they only ship their items? 
      // createShiprocketShipment handles splitting by seller, so passing targetSellerEmail filters it.
      const targetSellerEmail = isSeller ? session.user.email : undefined
      
      const shipments = await createShiprocketShipment(order, targetSellerEmail)
      
      // Save shipments to DB
      const saved = []
      for (const s of shipments) {
        // Check if exists
        const exists = await (Shipment as any).findOne({ shiprocketShipmentId: s.shipmentId })
        if (exists) {
          exists.awbCode = s.trackingNumber
          exists.courier = s.courier
          exists.invoiceUrl = s.invoiceUrl
          exists.labelUrl = s.labelUrl
          await exists.save()
          saved.push(exists)
        } else {
          const newS = await (Shipment as any).create({
            orderId: order._id,
            orderNumber: order.orderNumber,
            sellerEmail: s.sellerEmail,
            trackingNumber: s.trackingNumber,
            awbCode: s.trackingNumber,
            shiprocketShipmentId: s.shipmentId,
            shiprocketOrderId: s.shiprocketOrderId,
            courier: s.courier,
            invoiceUrl: s.invoiceUrl,
            labelUrl: s.labelUrl,
            status: "Created",
            items: s.items
          })
          saved.push(newS)
        }
      }
      return NextResponse.json({ success: true, shipments: saved })
    }

    if (action === "generate_pickup") {
      const { shipmentId } = params // DB ID or Shiprocket ID? Let's support DB ID first
      let s = await (Shipment as any).findById(shipmentId)
      if (!s) s = await (Shipment as any).findOne({ shiprocketShipmentId: shipmentId })
      
      if (!s) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
      
      const res = await requestPickup(token, s.shiprocketShipmentId)
      // Update status?
      s.status = "Pickup Scheduled"
      await s.save()
      return NextResponse.json(res)
    }

    if (action === "generate_manifest") {
      const { shipmentId } = params
      let s = await (Shipment as any).findById(shipmentId)
      if (!s) s = await (Shipment as any).findOne({ shiprocketShipmentId: shipmentId })
      if (!s) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })

      // 1. Generate
      await generateManifest(token, s.shiprocketShipmentId)
      
      // 2. Print (to get URL)
      if (s.shiprocketOrderId) {
        const res = await printManifest(token, s.shiprocketOrderId).catch(() => ({}))
        if (res.manifest_url) {
          s.manifestUrl = res.manifest_url
          await s.save()
          return NextResponse.json({ ...res, manifest_url: res.manifest_url })
        }
      }
      
      return NextResponse.json({ message: "Manifest generated, but print URL failed" })
    }

    if (action === "print_manifest") {
      const { shipmentId } = params // Need order_ids for print manifest?
      // printManifest takes order_id. We need to find the shiprocketOrderId.
      // Wait, Shipment model has shiprocketShipmentId. Does it have shiprocketOrderId?
      // createShiprocketShipment doesn't return shiprocketOrderId explicitly in the object... 
      // Let's check lib/shiprocket.ts: "const srOrderId = created?.order_id" ... but it pushes to shipments: { trackingNumber, ... }
      // It does NOT push srOrderId. I need to fix lib/shiprocket.ts to include shiprocketOrderId.
      
      let s = await (Shipment as any).findById(shipmentId)
      if (!s) s = await (Shipment as any).findOne({ shiprocketShipmentId: shipmentId })
      if (!s) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
      
      if (!s.shiprocketOrderId) {
         // Fallback? Or fail?
         return NextResponse.json({ error: "Shiprocket Order ID missing in shipment record" }, { status: 400 })
      }

      const res = await printManifest(token, s.shiprocketOrderId)
      if (res.manifest_url) {
        s.manifestUrl = res.manifest_url
        await s.save()
      }
      return NextResponse.json(res)
    }

    if (action === "generate_label") {
      const { shipmentId } = params
      let s = await (Shipment as any).findById(shipmentId)
      if (!s) s = await (Shipment as any).findOne({ shiprocketShipmentId: shipmentId })
      if (!s) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })

      const res = await generateLabel(token, s.shiprocketShipmentId)
      if (res.label_url) {
        s.labelUrl = res.label_url
        await s.save()
      }
      return NextResponse.json(res)
    }

    if (action === "print_invoice") {
      const { shipmentId } = params
      let s = await (Shipment as any).findById(shipmentId)
      if (!s) s = await (Shipment as any).findOne({ shiprocketShipmentId: shipmentId })
      if (!s) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
      
      if (!s.shiprocketOrderId) {
        return NextResponse.json({ error: "Shiprocket Order ID missing" }, { status: 400 })
      }

      const url = await generateInvoice(token, s.shiprocketOrderId)
      if (url) {
        s.invoiceUrl = url
        await s.save()
      }
      return NextResponse.json({ invoice_url: url })
    }

    if (action === "track") {
      const { awbCode } = params
      const data = await trackShipment(token, awbCode)
      return NextResponse.json(data)
    }

    if (action === "add_pickup_location") {
      const res = await addPickupLocation(token, params as any)
      return NextResponse.json(res)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (err: any) {
    console.error("Shiprocket API Error:", err)
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 })
  }
}

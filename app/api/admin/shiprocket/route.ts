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
  addPickupLocation
} from "@/lib/shiprocket"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
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

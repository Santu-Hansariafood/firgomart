
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getShipmentModel } from "@/lib/models/Shipment"
import { hasShiprocketCredentials, createShiprocketShipment } from "@/lib/shiprocket"

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
        const createdList = await createShiprocketShipment(order, sellerEmail)
        const created = createdList[0]
        if (!created) throw new Error("No shipment generated for this seller")
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

    let shipment = await (Shipment as any).findOne({ orderId: id, sellerEmail }).lean()
    if (!shipment && trackingNumber) {
       shipment = await (Shipment as any).findOne({ trackingNumber }).lean()
    }

    if (!shipment) {
      const now = new Date()
      shipment = await (Shipment as any).create({
        orderId: id,
        orderNumber: order.orderNumber,
        sellerEmail,
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
          sellerEmail,
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

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getShipmentModel } from "@/lib/models/Shipment"

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const trackingNumber = String(body?.trackingNumber || "").trim()
    const courier = String(body?.courier || "").trim()
    const sellerEmail = String(body?.sellerEmail || "").trim()
    if (!trackingNumber || !sellerEmail) {
      return NextResponse.json({ error: "trackingNumber and sellerEmail required" }, { status: 400 })
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

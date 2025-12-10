import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getShipmentModel } from "@/lib/models/Shipment"

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const status = String(body?.status || "").trim()
    const location = typeof body?.location === "string" ? body.location : undefined
    const note = typeof body?.note === "string" ? body.note : undefined
    const timeRaw = body?.time
    const time = typeof timeRaw === "string" || timeRaw instanceof Date ? new Date(timeRaw) : new Date()
    const sellerEmail = String(body?.sellerEmail || "").trim()
    if (!status || !sellerEmail) {
      return NextResponse.json({ error: "status and sellerEmail required" }, { status: 400 })
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

    const shipment = await (Shipment as any).findOne({ orderId: id })
    if (!shipment) return NextResponse.json({ error: "Shipment not found" }, { status: 404 })

    shipment.events = Array.isArray(shipment.events) ? shipment.events : []
    shipment.events.push({ time, status, location, note })
    shipment.status = status
    shipment.lastUpdate = new Date()
    await shipment.save()

    let updatedOrder = order
    if (status.toLowerCase() === "delivered") {
      updatedOrder = await (Order as any).findByIdAndUpdate(id, { status: "delivered", deliveredAt: new Date() }, { new: true }).lean()
    }

    return NextResponse.json({ shipment: shipment.toObject(), order: updatedOrder })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

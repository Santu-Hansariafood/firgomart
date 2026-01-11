import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getShipmentModel } from "@/lib/models/Shipment"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Shipment = getShipmentModel(conn)
    const order = await (Order as any).findById(id).lean()
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const shipment = await (Shipment as any).findOne({ orderId: id }).lean()
    const payload = {
      orderNumber: order.orderNumber,
      status: shipment?.status || order.status,
      trackingNumber: shipment?.trackingNumber || null,
      courier: shipment?.courier || null,
      // Add tracking array from Order model
      tracking: Array.isArray(order.tracking) ? order.tracking : [],
      lastUpdate: shipment?.lastUpdate || null,
      events: Array.isArray(shipment?.events) ? shipment?.events : [],
      destination: shipment?.destination || order.city || order.state || null,
    }
    return NextResponse.json({ tracking: payload })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

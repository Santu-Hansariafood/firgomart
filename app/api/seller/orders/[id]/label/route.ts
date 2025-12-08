import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const doc = await (Order as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ label: { orderNumber: doc.orderNumber, shipTo: { name: doc.buyerName, address: doc.address, city: doc.city, state: doc.state, pincode: doc.pincode, country: doc.country } } })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


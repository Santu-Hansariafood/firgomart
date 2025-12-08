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
    const sum = (doc.items || []).reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
    return NextResponse.json({ invoice: { orderNumber: doc.orderNumber, amount: sum, items: doc.items || [], buyer: { email: doc.buyerEmail, name: doc.buyerName } } })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


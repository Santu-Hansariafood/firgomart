import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const order = await (Order as any).findById(id).lean()
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    return NextResponse.json({ order })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message }, { status: 500 })
  }
}

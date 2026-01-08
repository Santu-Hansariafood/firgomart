import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = (url.searchParams.get("email") || "").trim()
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10))
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const docs = await (Order as any)
      .find({ buyerEmail: email })
      .sort("-createdAt")
      .limit(limit)
      .select({ _id: 1, orderNumber: 1, amount: 1, status: 1, createdAt: 1 })
      .lean()
    const orders = (docs as any[]).map((o) => ({
      id: typeof o._id === "string" ? o._id : (o._id?.toString?.() || String(o._id)),
      orderNumber: o.orderNumber,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    }))
    return NextResponse.json({ orders })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


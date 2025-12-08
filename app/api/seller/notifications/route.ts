import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const orders = await (Order as any).find({ status: { $in: ["pending", "paid"] } }).sort("-createdAt").limit(10).lean()
    const payments = await (Payment as any).find({ status: { $in: ["paid", "settled"] } }).sort("-createdAt").limit(10).lean()
    const notifications: any[] = []
    for (const o of orders) {
      notifications.push({ type: "order", message: `New order ${o.orderNumber}`, createdAt: o.createdAt })
    }
    for (const p of payments) {
      notifications.push({ type: "settlement", message: `Payment ${p.amount} ${p.status}`, createdAt: p.createdAt })
    }
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json({ notifications })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


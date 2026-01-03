import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { createRazorpayOrder, razorpayConfig } from "@/lib/razorpay"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const orderId = String(payload.orderId || "")
    if (!orderId) return NextResponse.json({ error: "Invalid orderId" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const order = await (Order as any).findById(orderId).lean()
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const amountPaise = Math.round(Number(order.amount || 0) * 100)
    const rpOrder = await createRazorpayOrder(amountPaise, order.orderNumber || orderId)
    return NextResponse.json({
      orderId,
      rpOrderId: rpOrder.id,
      amount: amountPaise,
      currency: rpOrder.currency,
      keyId: razorpayConfig.keyId,
      orderNumber: order.orderNumber,
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


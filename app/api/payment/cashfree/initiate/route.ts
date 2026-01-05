import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { createCashfreeOrder, cashfreeConfig } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    if (!cashfreeConfig.appId || !cashfreeConfig.secretKey) {
      return NextResponse.json({ error: "Cashfree not configured" }, { status: 400 })
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const cfOrderId = String(order.orderNumber || orderId)
    const resp = await createCashfreeOrder({
      orderId: cfOrderId,
      amount: Number(order.amount || 0),
      customerId: String(order.buyerEmail || cfOrderId),
      customerEmail: String(order.buyerEmail || ""),
      customerPhone: "",
      returnUrl: `${appUrl}/checkout/status?id=${orderId}&order_id={order_id}`,
    })
    return NextResponse.json({
      paymentSessionId: String(resp.payment_session_id || ""),
      orderId,
      cfOrderId,
      mode: (process.env.CASHFREE_MODE || (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"
import { verifyRazorpaySignature } from "@/lib/razorpay"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    const rpOrderId = String(body.razorpay_order_id || "")
    const rpPaymentId = String(body.razorpay_payment_id || "")
    const rpSignature = String(body.razorpay_signature || "")
    if (!orderId || !rpOrderId || !rpPaymentId || !rpSignature) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }
    const ok = await verifyRazorpaySignature(rpOrderId, rpPaymentId, rpSignature)
    if (!ok) return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })

    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

    order.status = "confirmed"
    order.completedAt = new Date()
    await order.save()

    await (Payment as any).create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      buyerEmail: order.buyerEmail,
      amount: order.amount,
      method: "RAZORPAY",
      status: "SUCCESS",
      transactionId: rpPaymentId,
      gateway: "RAZORPAY",
      settledAt: new Date(),
    })

    return NextResponse.json({ status: "confirmed", order: { id: String(order._id), orderNumber: order.orderNumber } })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

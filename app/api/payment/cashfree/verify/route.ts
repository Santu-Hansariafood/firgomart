import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"
import { getCashfreeOrder } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    const cfOrderIdRaw = String(body.cfOrderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const cfOrderId = cfOrderIdRaw || String(order.orderNumber || "")
    const resp = await getCashfreeOrder(cfOrderId)
    const status = String(resp.order_status || "").toUpperCase()
    if (status === "PAID") {
      order.status = "paid"
      order.completedAt = new Date()
      await order.save()
      const paymentsResp = Array.isArray(resp.payments) ? resp.payments : []
      const txnId = String(paymentsResp[0]?.cf_payment_id || resp.cf_order_id || cfOrderId)
      await (Payment as any).create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyerEmail: order.buyerEmail,
        amount: order.amount,
        method: "CASHFREE",
        status: "SUCCESS",
        transactionId: txnId,
        gateway: "CASHFREE",
        settledAt: new Date(),
      })
      return NextResponse.json({ status: "confirmed", order: { id: String(order._id), orderNumber: order.orderNumber } })
    }
    return NextResponse.json({ status: "pending" })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"
import { getProductModel } from "@/lib/models/Product"
import { getCashfreeOrder } from "@/lib/cashfree"
import type { ClientSession } from "mongoose"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    const cfOrderIdRaw = String(body.cfOrderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const Product = getProductModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const cfOrderId = cfOrderIdRaw || String(order.orderNumber || "")
    const resp = await getCashfreeOrder(cfOrderId)
    const status = String(resp.order_status || "").toUpperCase()
    if (status === "PAID") {
      const session: ClientSession = await (conn as unknown as { startSession: () => Promise<ClientSession> }).startSession()
      let stockOk = true
      await session.withTransaction(async () => {
        for (const it of (Array.isArray(order.items) ? order.items : [])) {
          const res = await (Product as unknown as {
            updateOne: (filter: unknown, update: unknown, options?: { session?: ClientSession }) => Promise<{ modifiedCount: number }>
          }).updateOne(
            { _id: it.productId, stock: { $gte: it.quantity } },
            { $inc: { stock: -it.quantity } },
            { session }
          )
          if (res.modifiedCount !== 1) {
            stockOk = false
            throw new Error("out_of_stock")
          }
        }
        order.status = "paid"
        order.completedAt = new Date()
        await order.save({ session })
        const paymentsResp = Array.isArray(resp.payments) ? resp.payments : []
        const txnId = String(paymentsResp[0]?.cf_payment_id || resp.cf_order_id || cfOrderId)
        await (Payment as any).create([{
          orderId: order._id,
          orderNumber: order.orderNumber,
          buyerEmail: order.buyerEmail,
          amount: order.amount,
          method: "CASHFREE",
          status: "SUCCESS",
          transactionId: txnId,
          gateway: "CASHFREE",
          settledAt: new Date(),
        }], { session })
      }).catch(async () => {
        stockOk = false
        order.status = "failed"
        await order.save()
      })
      await session.endSession()
      const paymentsResp = Array.isArray(resp.payments) ? resp.payments : []
      if (!stockOk) return NextResponse.json({ status: "failed", error: "Insufficient stock" }, { status: 409 })
      return NextResponse.json({ status: "confirmed", order: { id: String(order._id), orderNumber: order.orderNumber } })
    }
    return NextResponse.json({ status: "pending" })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

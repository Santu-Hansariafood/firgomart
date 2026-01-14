import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"
import { getProductModel } from "@/lib/models/Product"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import type { ClientSession } from "mongoose"

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
    const Product = getProductModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

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
      await (Payment as any).create([{
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyerEmail: order.buyerEmail,
        amount: order.amount,
        method: "RAZORPAY",
        status: "SUCCESS",
        transactionId: rpPaymentId,
        gateway: "RAZORPAY",
        settledAt: new Date(),
      }], { session })
    }).catch(async () => {
      stockOk = false
      order.status = "failed"
      await order.save()
    })
    await session.endSession()

    if (!stockOk) return NextResponse.json({ status: "failed", error: "Insufficient stock" }, { status: 409 })
    return NextResponse.json({ status: "confirmed", order: { id: String(order._id), orderNumber: order.orderNumber } })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

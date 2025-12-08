import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getPaymentModel } from "@/lib/models/Payment"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const sellerProducts = sellerEmail ? await (Product as any).find({ createdByEmail: sellerEmail }).select({ _id: 1 }).lean() : []
    const productIds = sellerProducts.map((p: any) => String(p._id))
    const q: any = {}
    if (productIds.length) q["items.productId"] = { $in: productIds as any }
    if (from || to) {
      q.createdAt = {}
      if (from) (q.createdAt as any).$gte = new Date(from)
      if (to) (q.createdAt as any).$lte = new Date(to)
    }
    const orders = await (Order as any).find(q).lean()
    let earnings = 0
    let totalOrders = orders.length
    let pending = 0
    let returned = 0
    for (const o of orders) {
      const items = (o.items || []).filter((it: any) => productIds.length ? productIds.includes(String(it.productId)) : true)
      const sum = items.reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
      earnings += sum
      if (String(o.status).toLowerCase() === "pending") pending++
      if (["returned", "refunded", "cancelled"].includes(String(o.status).toLowerCase())) returned++
    }
    const paymentsQ: any = sellerEmail ? { buyerEmail: sellerEmail } : {}
    const payments = await (Payment as any).find(paymentsQ).sort("-createdAt").limit(50).lean()
    return NextResponse.json({ summary: { earnings, totalOrders, pending, returned }, transactions: payments })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


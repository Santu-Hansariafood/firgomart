import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

type OrderLean = {
  _id?: unknown
  orderNumber?: string
  amount?: number
  status?: string
  createdAt?: string
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const buyerEmail = (url.searchParams.get("email") || "").trim()
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const q: Record<string, unknown> = {}
    if (buyerEmail) q.buyerEmail = buyerEmail
    const items = await (Order as unknown as {
      find: (q: unknown) => { sort: (arg: string) => { lean: () => Promise<OrderLean[]> } }
    }).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Order as unknown as { countDocuments: (q: unknown) => Promise<number> }).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    const safe = pageItems.map((o: OrderLean) => ({
      id: (o._id as { toString?: () => string } | undefined)?.toString?.() || String(o._id),
      orderNumber: o.orderNumber,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    }))
    return NextResponse.json({ orders: safe, total })
  } catch (err: unknown) {
    const reason = (err as { message?: string })?.message || "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

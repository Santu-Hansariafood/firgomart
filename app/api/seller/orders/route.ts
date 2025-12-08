import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    const search = (url.searchParams.get("search") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const Order = getOrderModel(conn)
    let productIds: string[] = []
    if (sellerEmail) {
      const sellerProducts = await (Product as any).find({ createdByEmail: sellerEmail }).select({ _id: 1 }).lean()
      productIds = sellerProducts.map((p: any) => String(p._id))
    }
    const q: any = {}
    if (productIds.length) q["items.productId"] = { $in: productIds as any }
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [{ orderNumber: r }, { buyerEmail: r }, { buyerName: r }]
    }
    const items = await (Order as any).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Order as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    const safe = pageItems.map((o: any) => ({
      id: o._id?.toString?.() || String(o._id),
      orderNumber: o.orderNumber,
      buyerEmail: o.buyerEmail,
      buyerName: o.buyerName,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
      items: (o.items || []).filter((it: any) => !productIds.length || productIds.includes(String(it.productId))).map((it: any) => ({
        productId: String(it.productId || ""),
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
    }))
    return NextResponse.json({ orders: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body?.id || "")
    const status = String(body?.status || "")
    const sellerEmail = String(body?.sellerEmail || "")
    if (!orderId || !status || !sellerEmail) return NextResponse.json({ error: "id, status, sellerEmail required" }, { status: 400 })
    if (!["packed", "shipped"].includes(status)) return NextResponse.json({ error: "status not allowed" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Product = getProductModel(conn)
    const order = await (Order as any).findById(orderId).lean()
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const sellerProducts = await (Product as any).find({ createdByEmail: sellerEmail }).select({ _id: 1 }).lean()
    const productIds = sellerProducts.map((p: any) => String(p._id))
    const hasSellerItem = (order.items || []).some((it: any) => productIds.includes(String(it.productId)))
    if (!hasSellerItem) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const updated = await (Order as any).findByIdAndUpdate(orderId, { status }, { new: true }).lean()
    return NextResponse.json({ order: updated })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


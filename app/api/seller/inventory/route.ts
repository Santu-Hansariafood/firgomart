import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim() // Expected to be passed by client for now
    
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    const minStock = url.searchParams.get("minStock")
    const maxStock = url.searchParams.get("maxStock")
    const search = (url.searchParams.get("search") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1
    
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const q: any = {}
    
    if (sellerEmail) {
        q.createdByEmail = sellerEmail
    } else {
        return NextResponse.json({ inventory: [], total: 0 })
    }

    if (minStock !== null && minStock !== undefined) q.stock = { ...(q.stock || {}), $gte: Number(minStock) }
    if (maxStock !== null && maxStock !== undefined) q.stock = { ...(q.stock || {}), $lte: Number(maxStock) }
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [
        { name: r },
        { category: r },
      ]
    }

    const items = await (Product as any).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Product as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    
    const safe = pageItems.map((p: any) => ({
      id: p._id?.toString?.() || String(p._id),
      name: p.name || "",
      category: p.category,
      stock: p.stock ?? 0,
      price: p.price ?? 0,
      image: p.image,
      sellerState: p.sellerState,
      sellerHasGST: p.sellerHasGST,
      createdAt: p.createdAt,
    }))
    
    return NextResponse.json({ inventory: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

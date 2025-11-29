import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "12", 10)))
    const search = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category") || ""
    const sort = url.searchParams.get("sort") || "-createdAt"

    const conn = await connectDB()
    const Product = getProductModel(conn)

    const query: Record<string, unknown> = {}
    if (search) query["name"] = { $regex: search, $options: "i" }
    if (category) query["category"] = category

    const total = await Product.countDocuments(query)
    const items = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ products: items, total, page, limit, hasMore: page * limit < total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await Product.create(body)
    return NextResponse.json({ product: doc }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

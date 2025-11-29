import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const item = await Product.findById(params.id).lean()
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ product: item }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

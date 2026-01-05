import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET() {
  try {
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const count = await Product.countDocuments({})
    return NextResponse.json({ count })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


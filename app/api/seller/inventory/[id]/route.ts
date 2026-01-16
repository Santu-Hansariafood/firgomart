import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const stock = Number(body?.stock)
    const sellerEmail = String(body?.sellerEmail || "").trim()

    if (!Number.isFinite(stock) || stock < 0) {
      return NextResponse.json({ error: "Invalid stock" }, { status: 400 })
    }
    
    if (!sellerEmail) {
        return NextResponse.json({ error: "sellerEmail required" }, { status: 400 })
    }

    const conn = await connectDB()
    const Product = getProductModel(conn)
    
    // Verify ownership
    const existing = await (Product as any).findById(id).lean()
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    if (String((existing as any).createdByEmail || "") !== sellerEmail) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const doc = await (Product as any).findByIdAndUpdate(id, { stock }, { new: true }).lean()
    
    return NextResponse.json({ product: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

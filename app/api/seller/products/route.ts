import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

// Allow sellers to create products with multiple images.
// This endpoint expects seller identity in the request body for now
// (e.g., sellerEmail). In a future iteration, we can secure this
// with a proper seller session token.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      image,
      images,
      category,
      price,
      originalPrice,
      discount,
      rating,
      reviews,
      description,
      sellerEmail,
    } = body || {}

    if (!name || !image || typeof price !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Seller identification (optional but recommended)
    const createdByEmail = typeof sellerEmail === "string" && sellerEmail ? sellerEmail : undefined

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await Product.create({
      name,
      image,
      images: Array.isArray(images) ? images : [],
      category,
      price,
      originalPrice,
      discount,
      rating,
      reviews,
      description,
      isAdminProduct: false,
      createdByEmail,
    })

    return NextResponse.json({ product: doc.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


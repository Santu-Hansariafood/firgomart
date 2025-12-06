import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

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

    // Determine seller delivery capabilities
    let sellerState: string | undefined = undefined
    let sellerHasGST: boolean | undefined = undefined
    if (createdByEmail) {
      try {
        const result = await findSellerAcrossDBs({ email: createdByEmail })
        if (result?.seller) {
          const st = (result.seller as any).state
          const hasGst = (result.seller as any).hasGST
          sellerState = typeof st === "string" ? st.trim() : undefined
          sellerHasGST = typeof hasGst === "boolean" ? hasGst : undefined
        }
      } catch {}
    }

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
      sellerState,
      sellerHasGST,
    })

    return NextResponse.json({ product: doc.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

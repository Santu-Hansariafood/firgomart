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
    const doc = await (Product as any).create({
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
    const q: any = {}
    if (sellerEmail) q.createdByEmail = sellerEmail
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [{ name: r }, { category: r }]
    }
    const items = await (Product as any).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Product as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    return NextResponse.json({ products: pageItems, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const id = String(body?.id || "")
    const stock = Number(body?.stock)
    const sellerEmail = String(body?.sellerEmail || "")
    if (!id || !Number.isFinite(stock)) return NextResponse.json({ error: "id and stock required" }, { status: 400 })
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (sellerEmail && String((doc as any).createdByEmail || "") !== sellerEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const updated = await (Product as any).findByIdAndUpdate(id, { stock }, { new: true }).lean()
    return NextResponse.json({ product: updated })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

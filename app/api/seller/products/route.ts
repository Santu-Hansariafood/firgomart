import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    let {
      name,
      image,
      images,
      category,
      subcategory,
      price,
      originalPrice,
      discount,
      stock,
      height,
      width,
      length,
      weight,
      dimensionUnit,
      lengthUnit,
      weightUnit,
      rating,
      reviews,
      description,
      details,
      hsnCode,
      gstNumber,
      brand,
      colors,
      sizes,
      about,
      additionalInfo,
      sellerEmail,
    } = body || {}

    const imgs: string[] = Array.isArray(images) ? images : []
    const primaryImage = String(image || (imgs[0] || ""))
    if (!name || typeof price !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const createdByEmail = typeof sellerEmail === "string" && sellerEmail ? sellerEmail : undefined

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
          if (!gstNumber && (result.seller as any).gstNumber) {
            gstNumber = (result.seller as any).gstNumber
          }
        }
      } catch {}
    }

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).create({
      name,
      image: primaryImage,
      images: imgs,
      category,
      subcategory,
      price,
      originalPrice,
      discount,
      stock,
      height,
      width,
      length,
      weight,
      dimensionUnit,
      lengthUnit,
      weightUnit,
      rating,
      reviews,
      description,
      details,
      hsnCode,
      gstNumber,
      brand,
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      about,
      additionalInfo,
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
    const status = (url.searchParams.get("status") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const q: any = {}
    if (sellerEmail) {
      q.createdByEmail = sellerEmail
    } else {
      return NextResponse.json({ products: [], total: 0 })
    }
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [{ name: r }, { category: r }]
    }
    if (status) q.status = status
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
    const stock = body?.stock !== undefined ? Number(body.stock) : undefined
    const price = body?.price !== undefined ? Number(body.price) : undefined
    const discount = body?.discount !== undefined ? Number(body.discount) : undefined
    const status = body?.status !== undefined ? String(body.status) : undefined
    const sellerEmail = String(body?.sellerEmail || "")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (sellerEmail && String((doc as any).createdByEmail || "") !== sellerEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const update: any = {}
    if (stock !== undefined && Number.isFinite(stock)) update.stock = stock
    if (price !== undefined && Number.isFinite(price)) update.price = price
    if (discount !== undefined && Number.isFinite(discount)) update.discount = discount
    if (status !== undefined) update.status = status
    if (body?.hsnCode !== undefined) update.hsnCode = String(body.hsnCode).trim()
    
    // Also allow updating other fields since the frontend sends them
    if (body?.name) update.name = String(body.name).trim()
    if (body?.description) update.description = String(body.description).trim()
    if (body?.about) update.about = String(body.about).trim()
    if (body?.additionalInfo) update.additionalInfo = String(body.additionalInfo).trim()
    if (body?.category) update.category = String(body.category).trim()
    if (body?.subcategory) update.subcategory = String(body.subcategory).trim()
    if (body?.brand) update.brand = String(body.brand).trim()
    if (body?.image) update.image = String(body.image).trim()
    if (Array.isArray(body?.images)) update.images = body.images
    if (Array.isArray(body?.colors)) update.colors = body.colors
    if (Array.isArray(body?.sizes)) update.sizes = body.sizes
    if (body?.height !== undefined) update.height = Number(body.height)
    if (body?.width !== undefined) update.width = Number(body.width)
    if (body?.length !== undefined) update.length = Number(body.length)
    if (body?.weight !== undefined) update.weight = Number(body.weight)
    if (body?.dimensionUnit) update.dimensionUnit = String(body.dimensionUnit)
    if (body?.lengthUnit) update.lengthUnit = String(body.lengthUnit)
    if (body?.weightUnit) update.weightUnit = String(body.weightUnit)
    if (body?.gstNumber) update.gstNumber = String(body.gstNumber).trim()
    
    if (!Object.keys(update).length) return NextResponse.json({ error: "No valid fields" }, { status: 400 })
    const updated = await (Product as any).findByIdAndUpdate(id, update, { new: true }).lean()
    return NextResponse.json({ product: updated })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = (url.searchParams.get("id") || "").trim()
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (sellerEmail && String((doc as any).createdByEmail || "") !== sellerEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await (Product as any).findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

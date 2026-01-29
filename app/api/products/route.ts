import { NextResponse } from "next/server"
import type { FilterQuery, Model } from "mongoose"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 20)))
    const page = Math.max(1, Number(url.searchParams.get("page") || 1))
    const adminOnly = (url.searchParams.get("adminOnly") || "").toLowerCase() === "true"
    const createdByEmail = (url.searchParams.get("createdByEmail") || "").trim()
    const deliverToStateRaw = (url.searchParams.get("deliverToState") || "").trim()
    const deliverToState = deliverToStateRaw ? deliverToStateRaw : ""
    const categoryParam = (url.searchParams.get("category") || "").trim()
    const subcategoryParam = (url.searchParams.get("subcategory") || "").trim()
    const search = (url.searchParams.get("search") || "").trim()
    const minPrice = Number(url.searchParams.get("minPrice"))
    const maxPrice = Number(url.searchParams.get("maxPrice"))
    const minRating = Number(url.searchParams.get("minRating"))
    const sizeParam = (url.searchParams.get("size") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "").trim()
    const skip = (page - 1) * limit
    const conn = await connectDB()
    const Product = getProductModel(conn)
    
    const conditions: Record<string, unknown>[] = []

    if (adminOnly) conditions.push({ isAdminProduct: true })
    if (createdByEmail) conditions.push({ createdByEmail })

    if (!isNaN(minPrice) && minPrice >= 0) {
      conditions.push({ price: { $gte: minPrice } })
    }
    if (!isNaN(maxPrice) && maxPrice > 0) {
      conditions.push({ price: { $lte: maxPrice } })
    }
    if (!isNaN(minRating) && minRating > 0) {
      conditions.push({ rating: { $gte: minRating } })
    }
    if (sizeParam) {
      conditions.push({ sizes: { $in: [new RegExp(`^${sizeParam}$`, "i")] } })
    }

    if (!createdByEmail) {
      if (deliverToState) {
        conditions.push({
          $or: [
            { isAdminProduct: true },
            { sellerHasGST: true },
            { sellerHasGST: false, sellerState: deliverToState },
          ]
        })
      } else {
        conditions.push({
          $or: [
            { isAdminProduct: true },
            { sellerHasGST: true },
          ]
        })
      }
    }

    if (categoryParam) {
      const cats = categoryParam.split(",").map(c => c.trim()).filter(Boolean)
      if (cats.length > 0) {
        const catRegexes = cats.map(c => new RegExp(c, "i"))
        conditions.push({ category: { $in: catRegexes } })
      }
    }

    if (subcategoryParam) {
      const subs = subcategoryParam.split(",").map(s => s.trim()).filter(Boolean)
      if (subs.length > 0) {
        const subRegexes = subs.map(s => new RegExp(s, "i"))
        conditions.push({ subcategory: { $in: subRegexes } })
      }
    }

    if (search) {
      const terms = search.split(/\s+/).filter(Boolean)
      if (terms.length > 0) {
        const termConditions = terms.map(term => {
          // Escape special regex characters to prevent errors
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(escapedTerm, "i")
          return {
            $or: [
              { name: { $regex: regex } },
              { brand: { $regex: regex } },
              { category: { $regex: regex } },
              { subcategory: { $regex: regex } },
              { description: { $regex: regex } },
            ]
          }
        })
        // Use $and to ensure all terms are present in the product fields
        conditions.push({ $and: termConditions })
      }
    }

    const finalQuery: FilterQuery<unknown> = conditions.length > 0 ? { $and: conditions } : {}
    
    let sortQuery: string | Record<string, number> = "-createdAt"
    if (sortBy === "price-asc") sortQuery = "price"
    else if (sortBy === "price-desc") sortQuery = "-price"
    else if (sortBy === "rating") sortQuery = "-rating"

    const ProductModel = Product as unknown as Model<Record<string, unknown>>
    const products = await ProductModel.find(finalQuery as FilterQuery<Record<string, unknown>>)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    function isAdminEmail(email?: string | null) {
      const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
      const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
      return !!(email && allow.includes(email.toLowerCase()))
    }

    const session = await getServerSession(authOptions)
    let adminEmail: string | null = session?.user?.email || null
    let allowed = isAdminEmail(adminEmail)

    if (!allowed) {
      const cookieHeader = request.headers.get("cookie") || ""
      const match = cookieHeader.split(/;\s*/).find(p => p.startsWith("admin_session="))
      if (match) {
        const val = match.split("=")[1] || ""
        const [email, sig] = val.split(".")
        const crypto = await import("crypto")
        const secret = process.env.NEXTAUTH_SECRET || "dev-secret"
        const expected = crypto.createHmac("sha256", secret).update(String(email)).digest("hex")
        if (sig === expected && isAdminEmail(email)) {
          allowed = true
          adminEmail = email
        }
      }
    }

    if (!allowed) {
      const hdrEmail = request.headers.get("x-admin-email")
      if (hdrEmail && isAdminEmail(hdrEmail)) {
        allowed = true
        adminEmail = hdrEmail
      }
    }

    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

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
      brand,
      colors,
      sizes,
      about,
      additionalInfo,
      hsnCode,
    } = body || {}
    const unitsPerPack = body?.unitsPerPack ? Number(body.unitsPerPack) : 1

    if (!name || !image || typeof price !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).create({
      name,
      image,
      images: Array.isArray(images) ? images : [],
      category,
      subcategory: typeof body?.subcategory === "string" ? String(body.subcategory).trim() : undefined,
      price,
      unitsPerPack,
      originalPrice,
      discount,
      rating,
      reviews,
      description,
      brand,
      colors,
      sizes,
      about,
      additionalInfo,
      hsnCode,
      isAdminProduct: true,
      createdByEmail: adminEmail || undefined,
      sellerHasGST: true,
    })

    return NextResponse.json({ product: doc.toObject() }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

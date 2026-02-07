import { NextResponse } from "next/server"
import type { FilterQuery, Model } from "mongoose"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getOfferModel } from "@/lib/models/Offer"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import categoriesData from "@/data/categories.json"

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
    const offerKey = (url.searchParams.get("offer") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "").trim()
    const skip = (page - 1) * limit
    const conn = await connectDB()
    const Product = getProductModel(conn)
    const Offer = getOfferModel(conn)
    
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
        // Optimization: Try to map to exact category names from JSON to use indexes efficiently
        const exactCats = cats.map(c => {
          const lowerC = c.toLowerCase()
          const match = categoriesData.categories.find(
            cat => cat.key.toLowerCase() === lowerC || cat.name.toLowerCase() === lowerC
          )
          return match ? match.name : c // Use exact name if found, else original
        })
        
        // Use exact match $in which leverages indexes better than regex
        // We still keep regex as fallback in OR if needed, but if we trust the mapping:
        // Let's use a smart approach: exact match for mapped ones, regex for others?
        // Simpler: Just use the mapped names. If exact match fails for custom cats, we might need regex.
        // But for performance, let's try to stick to exact matches for standard categories.
        
        const safeCats = exactCats.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const regexes = safeCats.map(c => new RegExp(`^${c}$`, "i"))
        
        // If we found exact matches in JSON, we can also push exact string matches to conditions
        // But to be safe and support case-insensitivity for unmapped inputs, we'll use the optimized regex
        // However, if we found a match, we should prefer the exact string in the query if possible
        // But $in takes an array. 
        
        // Best approach: Use the exact names from mapping and case-insensitive regex for robustness
        conditions.push({ category: { $in: regexes } })
      }
    }

    if (subcategoryParam) {
      const subs = subcategoryParam.split(",").map(s => s.trim()).filter(Boolean)
      if (subs.length > 0) {
        // Optimization: Map subcategories
        const exactSubs = subs.map(s => {
          const lowerS = s.toLowerCase()
          let found: string | undefined
          for (const cat of categoriesData.categories) {
             const match = cat.subcategories.find(sub => sub.toLowerCase() === lowerS)
             if (match) {
               found = match
               break
             }
          }
          return found || s
        })
        
        const safeSubs = exactSubs.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const regexes = safeSubs.map(s => new RegExp(`^${s}$`, "i"))
        conditions.push({ subcategory: { $in: regexes } })
      }
    }

    if (search) {
      const terms = search.split(/\s+/).filter(Boolean)
      if (terms.length > 0) {
        const termConditions = terms.map(term => {
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(escapedTerm, "i")
          if (term.toLowerCase() === "men") {
             return {
               $and: [
                 { 
                   $or: [
                     { name: { $regex: regex } },
                     { brand: { $regex: regex } },
                     { category: { $regex: regex } },
                     { subcategory: { $regex: regex } },
                     { description: { $regex: regex } },
                   ]
                 },
                 {
                   $nor: [
                     { name: { $regex: /women/i } },
                     { category: { $regex: /women/i } }
                   ]
                 }
               ]
             }
          }

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
        conditions.push({ $and: termConditions })
      }
    }

    if (offerKey) {
      try {
        const off = await (Offer as any).findOne({ key: offerKey, active: true }).lean()
        if (off) {
          const type = String((off as any).type || "").trim()
          const val = (off as any).value
          if (type === "discount-min") {
            const n = typeof val === "number" ? val : Number(val)
            if (!isNaN(n) && n > 0) conditions.push({ discount: { $gte: n } })
          } else if (type === "pack-min") {
            const n = typeof val === "number" ? val : Number(val)
            if (!isNaN(n) && n > 0) conditions.push({ unitsPerPack: { $gte: n } })
          } else if (type === "search") {
            const term = typeof val === "string" ? val.trim() : String(val || "").trim()
            if (term) {
              const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
              const regex = new RegExp(escapedTerm, "i")
              conditions.push({
                $or: [
                  { name: { $regex: regex } },
                  { brand: { $regex: regex } },
                  { category: { $regex: regex } },
                  { subcategory: { $regex: regex } },
                  { description: { $regex: regex } },
                ]
              })
            }
          } else if (type === "category") {
            const catField = (off as any).category
            const subField = (off as any).subcategory
            
            const cat = catField ? catField.trim() : (typeof val === "string" ? val.trim() : String(val || "").trim())
            const sub = subField ? subField.trim() : ""

            if (cat) {
              conditions.push({
                $or: [
                  { category: { $regex: new RegExp(`^${cat}$`, "i") } },
                  { category: { $regex: new RegExp(cat, "i") } },
                ]
              })
            }
            
            if (sub) {
               conditions.push({
                $or: [
                  { subcategory: { $regex: new RegExp(`^${sub}$`, "i") } },
                  { subcategory: { $regex: new RegExp(sub, "i") } },
                ]
              })
            }
          }

          // Apply category/subcategory filters for non-category types if specified
          if (type !== 'category') {
            const catField = (off as any).category
            const subField = (off as any).subcategory
            
            if (catField && catField.trim()) {
              const cat = catField.trim()
              conditions.push({
                $or: [
                  { category: { $regex: new RegExp(`^${cat}$`, "i") } },
                  { category: { $regex: new RegExp(cat, "i") } },
                ]
              })
            }
            
            if (subField && subField.trim()) {
              const sub = subField.trim()
              conditions.push({
                $or: [
                  { subcategory: { $regex: new RegExp(`^${sub}$`, "i") } },
                  { subcategory: { $regex: new RegExp(sub, "i") } },
                ]
              })
            }
          }
        }
      } catch {}
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

    try {
      const activeOffers = await (Offer as any).find({ 
        active: true, 
        $or: [
          { expiryDate: { $exists: false } }, 
          { expiryDate: { $gt: new Date() } }
        ]
      }).sort({ order: 1, _id: -1 }).lean();

      if (activeOffers.length > 0) {
        for (const p of products) {
          const prod = p as any;
          const pid = String(prod._id);
          const pCat = String(prod.category || "").toLowerCase();
          const pSub = String(prod.subcategory || "").toLowerCase();

          const matched = activeOffers.find((off: any) => {
            if (off.products && Array.isArray(off.products) && off.products.includes(pid)) return true;
            
            const hasSpecificProducts = off.products && Array.isArray(off.products) && off.products.length > 0;
            if (hasSpecificProducts) return false;
            
            if (off.type === 'category') {
               const offCat = String(off.category || "").toLowerCase();
               const offSub = String(off.subcategory || "").toLowerCase();
               if (offCat && offCat === pCat) {
                 if (offSub) return offSub === pSub;
                 return true;
               }
            }
            return false;
          });

          if (matched) {
             prod.appliedOffer = {
               name: matched.name,
               type: matched.type,
               value: matched.value
             };
          }
        }
      }
    } catch (e) {
      console.error("Error applying offers:", e);
    }

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

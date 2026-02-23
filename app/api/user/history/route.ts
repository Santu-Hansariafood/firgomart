import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const countryParam = (url.searchParams.get("country") || "").trim().toUpperCase()

    const result = await findUserAcrossDBs(email)
    if (!result?.user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const historyIds = result.user.recentlyViewed || []
    if (historyIds.length === 0) return NextResponse.json({ history: [] })

    const conn = await connectDB()
    const Product = getProductModel(conn)

    const baseQuery: Record<string, unknown> = { _id: { $in: historyIds } }
    if (countryParam) {
      baseQuery.availableCountry = countryParam
    }

    const products = await (Product as any).find(baseQuery).lean()

    const productMap = new Map(products.map((p: any) => [String(p._id), p]))
    const sorted = historyIds.map((id: any) => productMap.get(String(id))).filter(Boolean)

    return NextResponse.json({ history: sorted })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 })

    const result = await findUserAcrossDBs(email)
    if (!result?.user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const user = result.user
    let history = user.recentlyViewed || []
    const strId = String(productId)
    
    history = history.filter((id: any) => String(id) !== strId)
    
    history.unshift(productId)
    
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    user.recentlyViewed = history
    await user.save()

    return NextResponse.json({ success: true, history })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

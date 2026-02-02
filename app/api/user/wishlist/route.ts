import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const result = await findUserAcrossDBs(email)
    if (!result?.user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const wishlistIds = result.user.wishlist || []
    if (wishlistIds.length === 0) return NextResponse.json({ wishlist: [] })

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const products = await (Product as any).find({ _id: { $in: wishlistIds } }).lean()

    return NextResponse.json({ wishlist: products })
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
    const wishlist = user.wishlist || []
    const strId = String(productId)
    
    const index = wishlist.findIndex((id: any) => String(id) === strId)
    
    let added = false
    if (index > -1) {
      wishlist.splice(index, 1)
    } else {
      wishlist.push(productId)
      added = true
    }
    
    user.wishlist = wishlist
    await user.save()

    return NextResponse.json({ success: true, added, wishlist })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

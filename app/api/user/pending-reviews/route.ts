import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getReviewModel } from "@/lib/models/Review"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ products: [] })
    }

    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Review = getReviewModel(conn)
    const Product = getProductModel(conn)

    // 1. Find all delivered orders for this user
    const orders = await (Order as any).find({
      buyerEmail: session.user.email,
      status: "delivered",
      deliveredAt: { $exists: true }
    }).lean()

    if (!orders || orders.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // 2. Identify eligible products (delivered > 7 days ago)
    const now = new Date()
    const eligibleProductIds = new Set<string>()

    for (const order of orders) {
      const deliveredAt = new Date(order.deliveredAt)
      const returnPeriodEnds = new Date(deliveredAt)
      returnPeriodEnds.setDate(returnPeriodEnds.getDate() + 7)

      if (now > returnPeriodEnds) {
        for (const item of (order.items || [])) {
          if (item.productId) {
            eligibleProductIds.add(String(item.productId))
          }
        }
      }
    }

    if (eligibleProductIds.size === 0) {
      return NextResponse.json({ products: [] })
    }

    // 3. Filter out products already reviewed by this user
    const reviewedProducts = await (Review as any).find({
      userId: session.user.email,
      productId: { $in: Array.from(eligibleProductIds) }
    }).select("productId").lean()

    const reviewedIds = new Set(reviewedProducts.map((r: any) => String(r.productId)))
    const finalProductIds = Array.from(eligibleProductIds).filter(id => !reviewedIds.has(id))

    if (finalProductIds.length === 0) {
      return NextResponse.json({ products: [] })
    }

    // 4. Fetch product details
    const products = await (Product as any).find({
      _id: { $in: finalProductIds }
    }).lean()

    // Map _id to id for consistency
    const mappedProducts = products.map((p: any) => ({
      ...p,
      id: p._id
    }))

    return NextResponse.json({ products: mappedProducts })
  } catch (err: any) {
    console.error("Error fetching pending reviews:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

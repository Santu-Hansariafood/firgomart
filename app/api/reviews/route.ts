import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getReviewModel } from "@/lib/models/Review"
import { getProductModel } from "@/lib/models/Product"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")
    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 })

    const conn = await connectDB()
    const Review = getReviewModel(conn)
    
    const reviews = await (Review as any).find({ productId, status: "approved" }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ reviews })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Login required" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment } = body
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const conn = await connectDB()
    const Review = getReviewModel(conn)
    const Product = getProductModel(conn)

    const newReview = await (Review as any).create({
      productId,
      userId: session.user.email,
      userName: session.user.name || "Customer",
      rating,
      comment,
      status: "approved"
    })

    const allReviews = await (Review as any).find({ productId, status: "approved" }).lean()
    const count = allReviews.length
    const sum = allReviews.reduce((acc: number, r: any) => acc + r.rating, 0)
    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0

    await (Product as any).findByIdAndUpdate(productId, { rating: avg, reviews: count })

    return NextResponse.json({ review: newReview })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message }, { status: 500 })
  }
}

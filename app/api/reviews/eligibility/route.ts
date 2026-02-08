import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getReviewModel } from "@/lib/models/Review"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ canReview: false, reason: "Login required" })
    }

    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Review = getReviewModel(conn)

    // Check if already reviewed
    const existingReview = await (Review as any).findOne({
      productId,
      userId: session.user.email
    })

    if (existingReview) {
      return NextResponse.json({ canReview: false, reason: "Already reviewed", reviewId: existingReview._id })
    }

    // Check orders
    const orders = await (Order as any).find({
      buyerEmail: session.user.email,
      "items.productId": productId,
      status: "delivered",
      deliveredAt: { $exists: true }
    }).sort({ deliveredAt: -1 }).lean()

    if (!orders || orders.length === 0) {
       // Check if purchased but not delivered
       const anyOrder = await (Order as any).findOne({
        buyerEmail: session.user.email,
        "items.productId": productId
      }).lean()
      
      if (anyOrder) {
         return NextResponse.json({ canReview: false, reason: "Not delivered yet" })
      }
      return NextResponse.json({ canReview: false, reason: "Not purchased" })
    }

    const latestOrder = orders[0]
    const deliveredDate = new Date(latestOrder.deliveredAt)
    const returnPeriodEnds = new Date(deliveredDate)
    returnPeriodEnds.setDate(returnPeriodEnds.getDate() + 7)

    if (new Date() < returnPeriodEnds) {
      return NextResponse.json({ 
        canReview: false, 
        reason: "Return period active", 
        returnPeriodEnds 
      })
    }

    return NextResponse.json({ canReview: true })

  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

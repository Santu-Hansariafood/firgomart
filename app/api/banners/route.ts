import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getBannerModel } from "@/lib/models/Banner"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const conn = await connectDB()
    const Banner = getBannerModel(conn)
    
    const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 })
    
    return NextResponse.json({ banners })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

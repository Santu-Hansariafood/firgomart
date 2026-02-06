import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getCareerModel } from "@/lib/models/Career"

export async function GET() {
  try {
    const conn = await connectDB()
    const Career = getCareerModel(conn)
    const careers = await Career.find({ isActive: true }).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ careers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch careers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conn = await connectDB()
    const Career = getCareerModel(conn)
    const career = await Career.create(body)
    return NextResponse.json({ career }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create career" }, { status: 500 })
  }
}

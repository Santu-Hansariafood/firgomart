import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getDepartmentModel } from "@/lib/models/Department"

export async function GET() {
  try {
    const conn = await connectDB()
    const Department = getDepartmentModel(conn)
    const departments = await Department.find({}).sort({ order: 1 }).lean()
    return NextResponse.json(
      { departments },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conn = await connectDB()
    const Department = getDepartmentModel(conn)
    const department = await Department.create(body)
    return NextResponse.json({ department }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

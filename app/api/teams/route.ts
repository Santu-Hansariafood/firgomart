import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getTeamModel } from "@/lib/models/Team"

export async function GET() {
  try {
    const conn = await connectDB()
    const Team = getTeamModel(conn)
    const teams = await Team.find({}).sort({ order: 1, createdAt: -1 }).lean()
    return NextResponse.json(
      { teams },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conn = await connectDB()
    const Team = getTeamModel(conn)
    const team = await Team.create(body)
    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}

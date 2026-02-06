import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getTeamModel } from "@/lib/models/Team"

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const conn = await connectDB()
    const Team = getTeamModel(conn)
    const team = await Team.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!team) return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    return NextResponse.json({ team })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Team = getTeamModel(conn)
    const team = await Team.findByIdAndDelete(id)
    if (!team) return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}

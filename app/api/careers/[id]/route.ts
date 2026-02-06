import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getCareerModel } from "@/lib/models/Career"

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const conn = await connectDB()
    const Career = getCareerModel(conn)
    const career = await Career.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!career) return NextResponse.json({ error: "Career not found" }, { status: 404 })
    return NextResponse.json({ career })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update career" }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Career = getCareerModel(conn)
    const career = await Career.findByIdAndDelete(id)
    if (!career) return NextResponse.json({ error: "Career not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete career" }, { status: 500 })
  }
}

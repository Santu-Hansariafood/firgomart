import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getDepartmentModel } from "@/lib/models/Department"

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const conn = await connectDB()
    const Department = getDepartmentModel(conn)
    const department = await Department.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 })
    return NextResponse.json({ department })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Department = getDepartmentModel(conn)
    const department = await Department.findByIdAndDelete(id)
    if (!department) return NextResponse.json({ error: "Department not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}

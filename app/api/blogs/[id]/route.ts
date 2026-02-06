import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getBlogModel } from "@/lib/models/Blog"

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const conn = await connectDB()
    const Blog = getBlogModel(conn)
    const blog = await Blog.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    return NextResponse.json({ blog })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 })
  }
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Blog = getBlogModel(conn)
    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 })
  }
}

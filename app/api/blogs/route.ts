import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getBlogModel } from "@/lib/models/Blog"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    const conn = await connectDB()
    const Blog = getBlogModel(conn)
    
    if (slug) {
       const blog = await Blog.findOne({ slug, isPublished: true }).lean()
       if (!blog) return NextResponse.json({ error: "Blog not found" }, { status: 404 })
       return NextResponse.json({ blog })
    }

    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).lean()
    return NextResponse.json({ blogs })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const conn = await connectDB()
    const Blog = getBlogModel(conn)
    const blog = await Blog.create(body)
    return NextResponse.json({ blog }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 })
  }
}

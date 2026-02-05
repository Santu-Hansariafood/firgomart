import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getBannerModel } from "@/lib/models/Banner"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let adminEmail = session?.user?.email
    
    if (!adminEmail) {
      const headerEmail = req.headers.get("x-admin-email")
      if (headerEmail) adminEmail = headerEmail
    }

    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const conn = await connectDB()
    const Banner = getBannerModel(conn)

    const count = await Banner.countDocuments()
    const newBanner = new Banner({
      ...body,
      order: body.order ?? count
    })
    
    await newBanner.save()
    return NextResponse.json({ banner: newBanner })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let adminEmail = session?.user?.email
    
    if (!adminEmail) {
      const headerEmail = req.headers.get("x-admin-email")
      if (headerEmail) adminEmail = headerEmail
    }

    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: "Missing banner ID" }, { status: 400 })

    const conn = await connectDB()
    const Banner = getBannerModel(conn)

    const updated = await Banner.findByIdAndUpdate(id, updates, { new: true })
    if (!updated) return NextResponse.json({ error: "Banner not found" }, { status: 404 })

    return NextResponse.json({ banner: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let adminEmail = session?.user?.email
    
    if (!adminEmail) {
      const headerEmail = req.headers.get("x-admin-email")
      if (headerEmail) adminEmail = headerEmail
    }

    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conn = await connectDB()
    const Banner = getBannerModel(conn)
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 })

    return NextResponse.json({ banners })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let adminEmail = session?.user?.email
    
    if (!adminEmail) {
      const headerEmail = req.headers.get("x-admin-email")
      if (headerEmail) adminEmail = headerEmail
    }

    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    const conn = await connectDB()
    const Banner = getBannerModel(conn)
    await Banner.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

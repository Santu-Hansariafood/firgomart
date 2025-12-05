import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getSellerModel } from "@/lib/models/Seller"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email || null
  if (!isAdminEmail(email)) {
    return null
  }
  return session
}

export async function GET(request: Request) {
  try {
    const ok = await requireAdmin()
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const url = new URL(request.url)
    const status = url.searchParams.get("status") || ""
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const query: Record<string, unknown> = {}
    if (status) query.status = status
    const items = await Seller.find(query).sort("-createdAt").limit(100).lean()
    return NextResponse.json({ sellers: items })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const ok = await requireAdmin()
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await request.json()
    const { id, status } = body || {}
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const doc = await Seller.findByIdAndUpdate(id, { status }, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

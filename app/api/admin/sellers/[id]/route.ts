import { NextResponse, NextRequest } from "next/server"
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

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ok = await requireAdmin()
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const doc = await (Seller as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const ok = await requireAdmin()
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const body = await request.json()
    const allowed: Record<string, unknown> = {}
    const fields = [
      "businessName",
      "ownerName",
      "email",
      "phone",
      "address",
      "country",
      "state",
      "district",
      "city",
      "pincode",
      "gstNumber",
      "panNumber",
      "hasGST",
      "businessLogoUrl",
      "documentUrls",
      "status",
    ]
    for (const key of fields) {
      if (key in body) allowed[key] = body[key]
    }
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const doc = await (Seller as any).findByIdAndUpdate(id, allowed, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

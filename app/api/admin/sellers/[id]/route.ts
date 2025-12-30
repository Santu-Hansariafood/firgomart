import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getSellerModel } from "@/lib/models/Seller"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  let adminEmail: string | null = session?.user?.email || null
  let allowed = isAdminEmail(adminEmail)

  if (!allowed) {
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.split(/;\s*/).find(p => p.startsWith("admin_session="))
    if (match) {
      const val = match.split("=")[1] || ""
      const [email, sig] = val.split(".")
      const crypto = await import("crypto")
      const secret = process.env.NEXTAUTH_SECRET || "dev-secret"
      const expected = crypto.createHmac("sha256", secret).update(String(email)).digest("hex")
      if (sig === expected && isAdminEmail(email)) {
        allowed = true
        adminEmail = email
      }
    }
  }

  if (!allowed) {
    const hdrEmail = request.headers.get("x-admin-email")
    if (hdrEmail && isAdminEmail(hdrEmail)) {
      allowed = true
      adminEmail = hdrEmail
    }
  }

  return allowed ? adminEmail : null
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminEmail = await requireAdmin(req)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
    const adminEmail = await requireAdmin(request)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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
      "reviewNotes",
      "rejectionReason",
      "reviewedAt",
    ]
    for (const key of fields) {
      if (key in body) allowed[key] = body[key]
    }
    allowed["reviewedBy"] = body.reviewedBy || adminEmail
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const doc = await (Seller as any).findByIdAndUpdate(id, allowed, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

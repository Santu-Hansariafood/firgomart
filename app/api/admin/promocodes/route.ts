import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getPromoCodeModel } from "@/lib/models/PromoCode"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

async function requireAdmin(request: Request) {
  const session = await getServerSession(authOptions)
  let adminEmail: string | null = session?.user?.email || null
  let allowed = isAdminEmail(adminEmail)

  if (!allowed) {
    const cookieHeader = request.headers.get("cookie") || ""
    const match = cookieHeader.split(/;\s*/).find((p) => p.startsWith("admin_session="))
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

export async function GET() {
  try {
    const conn = await connectDB()
    const Promo = getPromoCodeModel(conn)
    const docs = await (Promo as any).find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ promoCodes: docs })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const adminEmail = await requireAdmin(request)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await request.json()
    const code = String(body?.code || "").trim().toUpperCase()
    const type = (String(body?.type || "percent").trim() === "flat") ? "flat" : "percent"
    const value = Number(body?.value || 0)
    const active = body?.active !== undefined ? !!body.active : true
    const startsAt = body?.startsAt ? new Date(body.startsAt) : undefined
    const endsAt = body?.endsAt ? new Date(body.endsAt) : undefined
    const maxRedemptions = body?.maxRedemptions !== undefined ? Number(body.maxRedemptions) : undefined
    const maxRedemptionsPerUser = body?.maxRedemptionsPerUser !== undefined ? Number(body.maxRedemptionsPerUser) : 1

    if (!/^[A-Z0-9]{8}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
    }
    if (!value || value < 0) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 })
    }

    const conn = await connectDB()
    const Promo = getPromoCodeModel(conn)
    const exists = await (Promo as any).findOne({ code }).lean()
    if (exists) return NextResponse.json({ error: "Code already exists" }, { status: 409 })

    const doc = await (Promo as any).create({
      code,
      type,
      value,
      active,
      startsAt,
      endsAt,
      maxRedemptions,
      maxRedemptionsPerUser,
      createdByEmail: adminEmail
    })
    return NextResponse.json({ promoCode: doc.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminEmail = await requireAdmin(request)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await request.json()
    const id = String(body?.id || "").trim()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const update: Record<string, unknown> = {}
    if (typeof body?.code === "string") {
      const c = String(body.code).trim().toUpperCase()
      if (!/^[A-Z0-9]{8}$/.test(c)) return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
      update.code = c
    }
    if (typeof body?.type === "string") update.type = body.type === "flat" ? "flat" : "percent"
    if (body?.value !== undefined) update.value = Number(body.value)
    if (body?.active !== undefined) update.active = !!body.active
    if (body?.startsAt !== undefined) update.startsAt = body.startsAt ? new Date(body.startsAt) : null
    if (body?.endsAt !== undefined) update.endsAt = body.endsAt ? new Date(body.endsAt) : null
    if (body?.maxRedemptions !== undefined) update.maxRedemptions = Number(body.maxRedemptions)
    if (body?.maxRedemptionsPerUser !== undefined) update.maxRedemptionsPerUser = Number(body.maxRedemptionsPerUser)

    const conn = await connectDB()
    const Promo = getPromoCodeModel(conn)
    const doc = await (Promo as any).findByIdAndUpdate(id, update, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ promoCode: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const adminEmail = await requireAdmin(request)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const body = await request.json()
    const id = String(body?.id || "").trim()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const conn = await connectDB()
    const Promo = getPromoCodeModel(conn)
    const res = await (Promo as any).findByIdAndDelete(id)
    if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


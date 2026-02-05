import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOfferModel } from "@/lib/models/Offer"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
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

  if (!allowed) {
    return { allowed: false as const, adminEmail: null }
  }
  return { allowed: true as const, adminEmail }
}

export async function GET() {
  try {
    const conn = await connectDB()
    const Offer = getOfferModel(conn)
    const docs = await (Offer as any).find({}).sort({ order: 1, name: 1 }).lean()
    return NextResponse.json({ offers: docs })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const key = String(body?.key || "").trim()
    const name = String(body?.name || "").trim()
    const type = String(body?.type || "").trim()
    const category = body?.category ? String(body.category).trim() : undefined
    const subcategory = body?.subcategory ? String(body.subcategory).trim() : undefined
    const products = Array.isArray(body?.products) ? body.products.map(String) : []
    const value = body?.value
    const active = body?.active !== undefined ? !!body.active : true
    const expiryDate = body?.expiryDate ? new Date(body.expiryDate) : undefined
    const order = typeof body?.order === "number" ? body.order : 0
    if (!key || !name || !type) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const conn = await connectDB()
    const Offer = getOfferModel(conn)
    const doc = await (Offer as any).create({
      key,
      name,
      type,
      category,
      subcategory,
      products,
      value,
      active,
      expiryDate,
      order,
      createdByEmail: auth.adminEmail || undefined,
    })
    return NextResponse.json({ offer: doc.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const id = String(body?.id || "").trim()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const update: Record<string, unknown> = {}
    if (typeof body?.key === "string") update.key = String(body.key).trim()
    if (typeof body?.name === "string") update.name = String(body.name).trim()
    if (typeof body?.type === "string") update.type = String(body.type).trim()
    if (typeof body?.category === "string") update.category = String(body.category).trim()
    if (typeof body?.subcategory === "string") update.subcategory = String(body.subcategory).trim()
    if (Array.isArray(body?.products)) update.products = body.products.map(String)
    if (body?.value !== undefined) update.value = body.value
    if (body?.active !== undefined) update.active = !!body.active
    if (body?.expiryDate !== undefined) update.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null
    if (typeof body?.order === "number") update.order = body.order
    if (!Object.keys(update).length) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    const conn = await connectDB()
    const Offer = getOfferModel(conn)
    const doc = await (Offer as any).findByIdAndUpdate(id, update, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ offer: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const id = String(body?.id || "").trim()
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const conn = await connectDB()
    const Offer = getOfferModel(conn)
    const res = await (Offer as any).findByIdAndDelete(id)
    if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


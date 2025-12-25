import { NextResponse, NextRequest } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

async function getActor(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessEmail = session?.user?.email || null
  if (isAdminEmail(sessEmail)) {
    return { role: "admin", email: sessEmail }
  }

  const cookieHeader = request.headers.get("cookie") || ""
  const match = cookieHeader.split(/;\s*/).find(p => p.startsWith("admin_session="))
  if (match) {
    const val = match.split("=")[1] || ""
    const [email, sig] = val.split(".")
    const crypto = await import("crypto")
    const secret = process.env.NEXTAUTH_SECRET || "dev-secret"
    const expected = crypto.createHmac("sha256", secret).update(String(email)).digest("hex")
    if (sig === expected && isAdminEmail(email)) {
      return { role: "admin", email }
    }
  }

  const hdrAdmin = request.headers.get("x-admin-email")
  if (hdrAdmin && isAdminEmail(hdrAdmin)) {
    return { role: "admin", email: hdrAdmin }
  }

  let sellerEmail = (request.headers.get("x-seller-email") || "").trim()
  try {
    const bodyText = await request.text()
    if (!sellerEmail && bodyText) {
      const body = JSON.parse(bodyText)
      if (typeof body?.sellerEmail === "string") sellerEmail = body.sellerEmail.trim()
      ;(request as any)._jsonBody = body
    }
  } catch {}

  if (sellerEmail) {
    try {
      const result = await findSellerAcrossDBs({ email: sellerEmail })
      if (result?.seller) {
        return { role: "seller", email: sellerEmail }
      }
    } catch {}
  }
  return { role: "guest", email: null }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    if (!id) return NextResponse.json({ error: "Product id required" }, { status: 400 })

    const actor = await getActor(request)
    if (actor.role === "guest") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let body: any
    try {
      body = (request as any)._jsonBody ?? await request.json()
    } catch {
      body = {}
    }

    const allowed: Record<string, boolean> = {
      description: true,
      details: true,
    }
    const updates: Record<string, unknown> = {}
    for (const key of Object.keys(body || {})) {
      if (allowed[key]) updates[key] = body[key]
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 })
    }

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const doc = await (Product as any).findById(id)
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (actor.role === "seller") {
      const createdByEmail = (doc as any).createdByEmail
      const isAdminProduct = !!(doc as any).isAdminProduct
      if (isAdminProduct || !createdByEmail || createdByEmail.toLowerCase() !== String(actor.email).toLowerCase()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    for (const [k, v] of Object.entries(updates)) {
      (doc as any)[k] = v
    }
    await (doc as any).save()
    return NextResponse.json({ product: (doc as any).toObject() })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

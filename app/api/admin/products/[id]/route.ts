import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
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

    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const body = await request.json()
    const conn = await connectDB()
    const Product = getProductModel(conn)
    type ProductModelLike = {
      findByIdAndUpdate: (id: string, update: Record<string, unknown>, opts: { new: boolean }) => Promise<unknown>
    }
    const ProductM = Product as unknown as ProductModelLike
    const updateData: Record<string, unknown> = { ...body }
    delete (updateData as { _id?: unknown })._id
    delete (updateData as { createdAt?: unknown }).createdAt
    delete (updateData as { updatedAt?: unknown }).updatedAt
    delete (updateData as { createdByEmail?: unknown }).createdByEmail
    const doc = await ProductM.findByIdAndUpdate(id, updateData, { new: true })
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    return NextResponse.json({ product: doc })
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
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

    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = params
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const conn = await connectDB()
    const Product = getProductModel(conn)
    type ProductModelLike = {
      findByIdAndDelete: (id: string) => Promise<unknown>
    }
    const ProductM = Product as unknown as ProductModelLike
    const doc = await ProductM.findByIdAndDelete(id)
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ deleted: String(id) })
  } catch (err: unknown) {
    const msg = typeof err === "object" && err && "message" in err ? String((err as { message?: unknown }).message) : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getShipmentModel } from "@/lib/models/Shipment"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

export async function GET(request: Request) {
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

    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    const status = (url.searchParams.get("status") || "").trim()
    const courier = (url.searchParams.get("courier") || "").trim()
    const search = (url.searchParams.get("search") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "lastUpdate").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1

    const conn = await connectDB()
    const Shipment = getShipmentModel(conn)
    const q: any = {}
    if (status) q.status = status
    if (courier) q.courier = { $regex: new RegExp(`^${courier}$`, "i") }
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [
        { trackingNumber: r },
        { orderNumber: r },
        { origin: r },
        { destination: r },
      ]
    }

    const items = await (Shipment as any).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Shipment as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    const safe = pageItems.map((s: any) => ({
      id: s._id?.toString?.() || String(s._id),
      orderNumber: s.orderNumber,
      trackingNumber: s.trackingNumber,
      courier: s.courier,
      status: s.status,
      origin: s.origin,
      destination: s.destination,
      lastUpdate: s.lastUpdate || s.updatedAt || s.createdAt,
      eventsCount: Array.isArray(s.events) ? s.events.length : 0,
    }))
    return NextResponse.json({ shipments: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


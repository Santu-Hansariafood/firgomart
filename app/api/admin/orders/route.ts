import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!allow.length && process.env.NODE_ENV !== "production") return !!email
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
    const country = (url.searchParams.get("country") || "").trim().toUpperCase()
    const state = (url.searchParams.get("state") || "").trim()
    const buyerEmail = (url.searchParams.get("buyerEmail") || "").trim()
    const search = (url.searchParams.get("search") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1

    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const q: any = {}
    if (status) {
      q.status = status
    } else {
      q.status = { $nin: ["pending", "failed"] }
    }
    if (country) q.country = { $regex: new RegExp(`^${country}$`, "i") }
    if (state) q.state = { $regex: new RegExp(`^${state}$`, "i") }
    if (buyerEmail) q.buyerEmail = { $regex: new RegExp(`^${buyerEmail}$`, "i") }
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [
        { orderNumber: r },
        { buyerEmail: r },
        { buyerName: r },
        { city: r },
        { state: r },
      ]
    }

    const items = await (Order as any).find(q).sort(sortOrder > 0 ? sortBy : `-${sortBy}`).lean()
    const total = await (Order as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    const safe = pageItems.map((o: any) => ({
      id: o._id?.toString?.() || String(o._id),
      orderNumber: o.orderNumber,
      buyerEmail: o.buyerEmail,
      buyerName: o.buyerName,
      amount: o.amount,
      status: o.status,
      city: o.city,
      state: o.state,
      country: o.country,
      createdAt: o.createdAt,
    }))
    return NextResponse.json({ orders: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

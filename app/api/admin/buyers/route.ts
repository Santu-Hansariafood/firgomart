import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"

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
    const country = (url.searchParams.get("country") || "").trim().toUpperCase()
    const state = (url.searchParams.get("state") || "").trim()
    const search = (url.searchParams.get("search") || "").trim()
    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim()
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").trim().toLowerCase() === "asc" ? 1 : -1

    const conns: any[] = []
    const pushConn = async (c?: string, l?: string) => {
      try { conns.push(await connectDB(c, l)) } catch {}
    }
    if (!country || country === "ALL") {
      await pushConn("US")
      await pushConn("EU")
      await pushConn("IN")
      for (const loc of ["WB", "MH", "TN", "DL", "RJ"]) await pushConn("IN", loc)
    } else if (country === "IN") {
      await pushConn("IN")
      for (const loc of ["WB", "MH", "TN", "DL", "RJ"]) await pushConn("IN", loc)
    } else if (country === "US") {
      await pushConn("US")
    } else if (country === "EU") {
      await pushConn("EU")
    }

    const items: any[] = []
    const counts: number[] = []
    for (const conn of conns) {
      const User = getUserModel(conn)
      const q: any = {}
      if (state) q.state = { $regex: new RegExp(`^${state}$`, "i") }
      if (search) {
        const r = new RegExp(search, "i")
        q.$or = [
          { name: r },
          { email: r },
          { mobile: r },
          { city: r },
          { state: r },
          { country: r },
        ]
      }
      const part = await (User as any).find(q).lean()
      const cnt = await (User as any).countDocuments(q)
      items.push(...part)
      counts.push(cnt)
    }
    items.sort((a, b) => {
      const av = a[sortBy]
      const bv = b[sortBy]
      if (av === bv) return 0
      if (av === undefined) return 1 * sortOrder
      if (bv === undefined) return -1 * sortOrder
      return av > bv ? sortOrder : -sortOrder
    })
    const total = counts.reduce((s, n) => s + n, 0)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    const safe = pageItems.map((u: any) => ({
      id: u._id?.toString?.() || String(u._id),
      name: u.name,
      email: u.email,
      mobile: u.mobile,
      address: u.address,
      city: u.city,
      state: u.state,
      pincode: u.pincode,
      dateOfBirth: u.dateOfBirth,
      gender: u.gender,
      country: u.country,
      createdAt: u.createdAt,
    }))
    return NextResponse.json({ buyers: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

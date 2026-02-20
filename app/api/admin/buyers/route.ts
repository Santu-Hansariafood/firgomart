import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"
import type { Connection } from "mongoose"

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

    const conns: Connection[] = []
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

    const items: Record<string, unknown>[] = []
    const counts: number[] = []
    for (const conn of conns) {
      const User = getUserModel(conn)
      const q: Record<string, unknown> = {}
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
      const part = await User.find(q).lean()
      const cnt = await User.countDocuments(q)
      items.push(...part)
      counts.push(cnt)
    }
    items.sort((a, b) => {
      const av = a[sortBy] as string | number | Date | undefined
      const bv = b[sortBy] as string | number | Date | undefined
      if (av === bv) return 0
      if (av === undefined) return 1 * sortOrder
      if (bv === undefined) return -1 * sortOrder
      return av > bv ? sortOrder : -sortOrder
    })

    const uniqueItems: Record<string, unknown>[] = []
    const seenEmails = new Set<string>()
    for (const item of items) {
      const u = item as { email?: string }
      const email = (u.email || "").toLowerCase().trim()
      if (email) {
        if (!seenEmails.has(email)) {
          seenEmails.add(email)
          uniqueItems.push(item)
        }
      } else {
        uniqueItems.push(item)
      }
    }

    const total = uniqueItems.length
    const start = (page - 1) * limit
    const pageItems = uniqueItems.slice(start, start + limit)
    const safe = pageItems.map((u) => {
      const user = u as {
        _id?: { toString(): string } | string
        name?: string
        email?: string
        mobile?: string
        address?: string
        city?: string
        state?: string
        pincode?: string
        dateOfBirth?: string
        gender?: string
        country?: string
        createdAt?: string
      }
      return {
        id: typeof user._id === "object" && user._id && "toString" in user._id ? user._id.toString() : String(user._id),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        createdAt: user.createdAt,
      }
    })
    return NextResponse.json({ buyers: safe, total })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: message }, { status: 500 })
  }
}

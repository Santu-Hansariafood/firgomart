import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getSellerModel } from "@/lib/models/Seller"

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
    const gstFilter = (url.searchParams.get("gst") || "").trim().toUpperCase()
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
    // We'll collect all items first, then deduplicate by ID
    // This handles the case where multiple connections point to the same DB (e.g. dev env)
    
    for (const conn of conns) {
      const Seller = getSellerModel(conn)
      const q: any = {}
      if (status) q.status = status
      if (gstFilter === "GST") q.hasGST = true
      else if (gstFilter === "NON_GST") q.hasGST = { $ne: true }
      if (state) q.state = { $regex: new RegExp(`^${state}$`, "i") }
      if (search) {
        const r = new RegExp(search, "i")
        q.$or = [
          { businessName: r },
          { ownerName: r },
          { email: r },
          { phone: r },
          { city: r },
          { state: r },
          { country: r },
        ]
      }
      const part = await (Seller as any).find(q).lean()
      items.push(...part)
    }

    // Deduplicate items by _id
    const uniqueItemsMap = new Map<string, any>()
    items.forEach(item => {
      const id = item._id?.toString() || String(item._id)
      if (!uniqueItemsMap.has(id)) {
        uniqueItemsMap.set(id, item)
      }
    })
    const uniqueItems = Array.from(uniqueItemsMap.values())

    uniqueItems.sort((a, b) => {
      const av = a[sortBy]
      const bv = b[sortBy]
      if (av === bv) return 0
      if (av === undefined) return 1 * sortOrder
      if (bv === undefined) return -1 * sortOrder
      return av > bv ? sortOrder : -sortOrder
    })
    
    const total = uniqueItems.length
    const start = (page - 1) * limit
    const pageItems = uniqueItems.slice(start, start + limit)
    const safe = pageItems.map((s: any) => ({
      id: s._id?.toString?.() || String(s._id),
      businessName: s.businessName,
      ownerName: s.ownerName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      city: s.city,
      state: s.state,
      district: s.district,
      pincode: s.pincode,
      country: s.country,
      status: s.status,
      hasGST: s.hasGST,
      gstNumber: s.gstNumber,
      panNumber: s.panNumber,
      aadhaar: s.aadhaar,
      businessLogoUrl: s.businessLogoUrl,
      bankAccount: s.bankAccount,
      bankIfsc: s.bankIfsc,
      bankName: s.bankName,
      bankBranch: s.bankBranch,
      bankDocumentUrl: s.bankDocumentUrl,
      createdAt: s.createdAt,
    }))
    return NextResponse.json({ sellers: safe, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const body = await request.json()
    const { id, status } = body || {}
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 })
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const doc = await (Seller as any).findByIdAndUpdate(id, { status }, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

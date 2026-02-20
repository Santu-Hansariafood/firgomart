import { NextRequest, NextResponse } from "next/server"
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

async function getBuyerByIdAcrossDBs(id: string) {
  const conns: Connection[] = []
  try { conns.push(await connectDB()) } catch {}
  try { conns.push(await connectDB("US")) } catch {}
  try { conns.push(await connectDB("EU")) } catch {}
  try { conns.push(await connectDB("IN")) } catch {}
  for (const loc of ["WB", "MH", "TN", "DL", "RJ"]) {
    try { conns.push(await connectDB("IN", loc)) } catch {}
  }

  for (const conn of conns) {
    const User = getUserModel(conn)
    const doc = await User.findById(id)
    if (doc) return { User, doc }
  }
  return null
}

type BuyerUpdatePayload = {
  name?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  dateOfBirth?: string
  gender?: string
  country?: string
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin(request)
  if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing buyer id" }, { status: 400 })

  const body = await request.json() as BuyerUpdatePayload
  const updates: BuyerUpdatePayload = {}

  if (typeof body.name === "string") updates.name = body.name.trim()
  if (typeof body.mobile === "string") {
    const digits = body.mobile.replace(/\D/g, "")
    updates.mobile = digits
  }
  if (typeof body.address === "string") updates.address = body.address.trim()
  if (typeof body.city === "string") updates.city = body.city.trim()
  if (typeof body.state === "string") updates.state = body.state.trim()
  if (typeof body.pincode === "string") updates.pincode = body.pincode.trim()
  if (typeof body.dateOfBirth === "string") updates.dateOfBirth = body.dateOfBirth.trim()
  if (typeof body.gender === "string") updates.gender = body.gender.trim()
  if (typeof body.country === "string") updates.country = body.country.trim()

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const found = await getBuyerByIdAcrossDBs(id)
  if (!found) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })

  Object.assign(found.doc, updates)
  await found.doc.save()

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await requireAdmin(request)
  if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: "Missing buyer id" }, { status: 400 })

  const found = await getBuyerByIdAcrossDBs(id)
  if (!found) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })

  await found.User.deleteOne({ _id: found.doc._id })

  return NextResponse.json({ success: true })
}

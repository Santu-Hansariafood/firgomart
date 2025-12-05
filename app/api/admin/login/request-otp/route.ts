import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Not an admin email" }, { status: 403 })
    }
    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }
    const fixed = (process.env.ADMIN_FIXED_OTP || "").trim()
    const otp = fixed ? fixed : Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    const u = result.user as any
    u.adminLoginOtp = otp
    u.adminLoginOtpExpires = expires
    await u.save()
    const payload: Record<string, unknown> = { success: true }
    if (process.env.NODE_ENV !== "production") payload.otp = otp
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

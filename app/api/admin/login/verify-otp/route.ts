import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"
import { createHmac } from "crypto"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!allow.length && process.env.NODE_ENV !== "production") return !!email
  return !!(email && allow.includes(email.toLowerCase()))
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or otp" }, { status: 400 })
    }
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Not an admin email" }, { status: 403 })
    }
    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }
    const u = result.user as any
    const valid = u.adminLoginOtp && typeof u.adminLoginOtp === "string" && u.adminLoginOtp === otp
    const notExpired = u.adminLoginOtpExpires && new Date(u.adminLoginOtpExpires).getTime() > Date.now()
    
    if (!(valid && notExpired)) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }
    u.adminLoginOtp = undefined
    u.adminLoginOtpExpires = undefined
    await u.save()
    const safe = {
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      role: "admin",
    }
    const secret = process.env.NEXTAUTH_SECRET || "dev-secret"
    const sig = createHmac("sha256", secret).update(String(u.email)).digest("hex")
    const token = `${u.email}.${sig}`
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
    const cookie = `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`
    const res = NextResponse.json({ admin: safe }, { status: 200 })
    res.headers.set("Set-Cookie", cookie)
    return res
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

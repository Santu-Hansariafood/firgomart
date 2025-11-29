import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

export async function POST(request: Request) {
  try {
    const { phone, otp } = await request.json()
    if (!phone || !otp) {
      return NextResponse.json({ error: "Missing phone or otp" }, { status: 400 })
    }
    const result = await findSellerAcrossDBs({ phone })
    if (!result) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }
    const s = result.seller as any
    const valid = s.loginOtp && typeof s.loginOtp === "string" && s.loginOtp === otp
    const notExpired = s.loginOtpExpires && new Date(s.loginOtpExpires).getTime() > Date.now()
    if (!valid || !notExpired) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }
    s.loginOtp = undefined
    s.loginOtpExpires = undefined
    await s.save()
    const safe = {
      id: s._id.toString(),
      email: s.email,
      name: s.businessName,
      phone: s.phone,
      role: "seller",
    }
    return NextResponse.json({ seller: safe }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

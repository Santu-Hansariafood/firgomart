import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

type SellerDoc = {
  _id?: { toString(): string }
  id?: string
  status?: string
  email?: string
  businessName?: string
  loginOtp?: string
  loginOtpExpires?: Date
  save: () => Promise<unknown>
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ error: "Missing email or otp" }, { status: 400 })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const result = await findSellerAcrossDBs({ email: normalizedEmail })
    if (!result) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }
    const s = result.seller as unknown as SellerDoc
    const approved = String(s.status || "").toLowerCase() === "approved"
    if (!approved) {
      return NextResponse.json({ error: "Seller not approved" }, { status: 403 })
    }
    const valid = s.loginOtp && typeof s.loginOtp === "string" && s.loginOtp === otp
    const notExpired = s.loginOtpExpires && new Date(s.loginOtpExpires).getTime() > Date.now()
    if (!valid || !notExpired) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }
    s.loginOtp = undefined
    s.loginOtpExpires = undefined
    await s.save()
    const safe = {
      id: s._id ? s._id.toString() : String((s as { id?: unknown }).id || ""),
      email: s.email,
      name: s.businessName,
      role: "seller",
    }
    return NextResponse.json({ seller: safe }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

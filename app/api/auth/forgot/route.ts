import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"

type UserDoc = {
  resetOtp?: string
  resetOtpExpires?: Date
  save: () => Promise<unknown>
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    const u = result.user as unknown as UserDoc
    u.resetOtp = otp
    u.resetOtpExpires = expires
    await u.save()
    console.log("Password reset OTP", { email, otp })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

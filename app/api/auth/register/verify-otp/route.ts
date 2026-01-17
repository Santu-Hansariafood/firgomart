import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getEmailOtpModel } from "@/lib/models/EmailOtp"

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and otp required" }, { status: 400 })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const code = String(otp).trim()
    const conn = await connectDB()
    const EmailOtp = getEmailOtpModel(conn)
    const doc = await (EmailOtp as any).findOne({ email: normalizedEmail, purpose: "user-register" })
    if (!doc) {
      return NextResponse.json({ error: "OTP not found" }, { status: 404 })
    }
    const valid = typeof doc.code === "string" && doc.code === code
    const notExpired = doc.expiresAt && new Date(doc.expiresAt).getTime() > Date.now()
    if (!valid || !notExpired) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }
    doc.verified = true
    await doc.save()
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}


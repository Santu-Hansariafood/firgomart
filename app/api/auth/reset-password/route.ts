import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"
import { hash } from "bcryptjs"

type UserDoc = {
  passwordHash?: string
  resetOtp?: string
  resetOtpExpires?: Date
  save: () => Promise<unknown>
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email : ""
    const token = typeof body?.token === "string" ? body.token : ""
    const password = typeof body?.password === "string" ? body.password : ""

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Email, token and password are required" }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const u = result.user as unknown as UserDoc
    const stored = typeof u.resetOtp === "string" ? u.resetOtp : ""
    const exp = u.resetOtpExpires ? new Date(u.resetOtpExpires).getTime() : 0
    const now = Date.now()
    const valid = stored && stored === token && exp > now
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    const passwordHash = await hash(password, 10)
    u.passwordHash = passwordHash
    u.resetOtp = undefined
    u.resetOtpExpires = undefined
    await u.save()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}


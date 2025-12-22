import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

type SellerDoc = {
  status?: string
  loginOtp?: string
  loginOtpExpires?: Date
  save: () => Promise<unknown>
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 })
    }
    const result = await findSellerAcrossDBs({ phone })
    if (!result) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }
    const s = result.seller as SellerDoc
    const approved = String(s.status || "").toLowerCase() === "approved"
    if (!approved) {
      return NextResponse.json({ error: "Seller not approved" }, { status: 403 })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    s.loginOtp = otp
    s.loginOtpExpires = expires
    await s.save()
    const payload: Record<string, unknown> = { success: true }
    if (process.env.NODE_ENV !== "production") payload.otp = otp
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

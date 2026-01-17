import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import nodemailer from "nodemailer"

type SellerDoc = {
  email?: string
  status?: string
  loginOtp?: string
  loginOtpExpires?: Date
  save: () => Promise<unknown>
}

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || "465")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) throw new Error("Missing SMTP configuration")
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const result = await findSellerAcrossDBs({ email: normalizedEmail })
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
    const targetEmail = String(s.email || normalizedEmail).trim().toLowerCase()
    if (!targetEmail) {
      return NextResponse.json({ error: "Seller email not configured" }, { status: 500 })
    }
    const transport = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || targetEmail
    await transport.sendMail({
      from,
      to: targetEmail,
      subject: "Firgomart seller login OTP",
      text: `Your OTP for seller login is ${otp}. It is valid for 10 minutes.`,
    })
    const payload: Record<string, unknown> = { success: true }
    if (process.env.NODE_ENV !== "production") payload.otp = otp
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

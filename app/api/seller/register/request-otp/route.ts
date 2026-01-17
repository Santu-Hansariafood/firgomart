import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getEmailOtpModel } from "@/lib/models/EmailOtp"
import nodemailer from "nodemailer"

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
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const normalized = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }
    const conn = await connectDB()
    const EmailOtp = getEmailOtpModel(conn)
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await (EmailOtp as any).deleteMany({ email: normalized, purpose: "seller-register" })
    await (EmailOtp as any).create({
      email: normalized,
      purpose: "seller-register",
      code,
      expiresAt,
      verified: false,
    })
    const payload: Record<string, unknown> = { success: true }
    if (process.env.NODE_ENV !== "production") payload.otp = code
    try {
      const transport = createTransport()
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || normalized
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "")
      const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || (appUrl ? `${appUrl}/logo.png` : "")
      const subject = "Firgomart | Verify your seller email"
      const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .wrapper { width: 100%; padding: 24px 0; }
      .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 35px rgba(15, 23, 42, 0.12); }
      .header { background: linear-gradient(135deg, #6d28d9, #ec4899); padding: 24px 24px 20px 24px; color: #f9fafb; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .logo-circle { width: 40px; height: 40px; border-radius: 9999px; background: rgba(15, 23, 42, 0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .logo-circle span { font-weight: 700; font-size: 20px; }
      .title { font-size: 18px; font-weight: 600; margin-top: 8px; }
      .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
      .content { padding: 24px; color: #111827; background-color: #ffffff; }
      .greeting { font-size: 15px; margin-bottom: 8px; }
      .text { font-size: 14px; line-height: 1.55; color: #4b5563; margin: 6px 0; }
      .otp-box { margin: 24px 0 18px 0; text-align: center; }
      .otp-label { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; margin-bottom: 8px; }
      .otp-value { display: inline-block; padding: 12px 24px; border-radius: 9999px; background: #f5f3ff; color: #4c1d95; font-weight: 700; font-size: 22px; letter-spacing: 0.35em; box-shadow: 0 6px 18px rgba(129, 140, 248, 0.35); }
      .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; padding: 6px 10px; border-radius: 9999px; background-color: #fef3c7; color: #92400e; margin-bottom: 12px; }
      .footer { padding: 16px 24px 20px 24px; font-size: 11px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
      .link { color: #4f46e5; text-decoration: none; }
      .meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }
      @media (max-width: 600px) {
        .container { border-radius: 0; }
        .content { padding: 20px 16px; }
        .header { padding: 20px 16px 18px 16px; }
        .otp-value { font-size: 20px; padding: 10px 18px; letter-spacing: 0.25em; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="brand">
            <div class="logo-circle">
              ${logoUrl ? `<img src="${logoUrl}" alt="Firgomart" style="max-width: 26px; max-height: 26px; border-radius: 9999px;" />` : `<span>F</span>`}
            </div>
            <div>
              <div style="font-size:16px;font-weight:600;">Firgomart</div>
              <div style="font-size:11px;opacity:0.9;">Smart marketplace for modern sellers</div>
            </div>
          </div>
          <div class="title">Verify your seller email</div>
          <div class="subtitle">Use the one-time passcode below to complete your seller registration.</div>
        </div>
        <div class="content">
          <p class="greeting">Hi there,</p>
          <p class="text">
            Thank you for choosing <strong>Firgomart</strong>. To keep your account secure, we need to verify your
            email address before you can continue with the seller registration.
          </p>
          <div class="otp-box">
            <div class="badge">
              <span>🔐</span>
              <span>One-time verification code</span>
            </div>
            <div class="otp-value">${code}</div>
          </div>
          <p class="text">
            This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone — our team will
            never ask you for it.
          </p>
          <p class="text" style="margin-top:18px;">
            If you did not request this email, you can safely ignore it. Your seller account will not be created without
            completing this verification.
          </p>
        </div>
        <div class="footer">
          <div>Best regards,</div>
          <div><strong>Firgomart Team</strong></div>
          <div class="meta" style="margin-top:8px;">
            This is an automated message for seller registration verification. Please do not reply to this email.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
      `
      await transport.sendMail({
        from,
        to: normalized,
        subject,
        text: `Your OTP for seller registration is ${code}. It is valid for 10 minutes.`,
        html,
      })
      return NextResponse.json(payload, { status: 200 })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown"
      if (process.env.NODE_ENV !== "production") {
        console.error("Email OTP send failed (dev fallback)", msg)
        return NextResponse.json(payload, { status: 200 })
      }
      throw e
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

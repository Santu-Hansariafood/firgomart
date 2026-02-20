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
    const s = result.seller as unknown as SellerDoc
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
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/+$/, "")
    const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || (appUrl ? `${appUrl}/logo.png` : "")
    const subject = "FirgoMart | Seller login OTP"
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
              ${
                logoUrl
                  ? `<img src="${logoUrl}" alt="FirgoMart" style="max-width: 26px; max-height: 26px; border-radius: 9999px;" />`
                  : `<span>F</span>`
              }
            </div>
            <div>
              <div style="font-size:16px;font-weight:600;">FirgoMart</div>
              <div style="font-size:11px;opacity:0.9;">Smart marketplace for modern sellers</div>
            </div>
          </div>
          <div class="title">Seller login verification</div>
          <div class="subtitle">Use this one-time passcode to securely sign in to your seller account.</div>
        </div>
        <div class="content">
          <p class="greeting">Hi there,</p>
          <p class="text">
            To keep your <strong>FirgoMart</strong> seller account secure, we need to confirm it's really you trying to log in.
          </p>
          <div class="otp-box">
            <div class="badge">
              <span>🔐</span>
              <span>One-time login code</span>
            </div>
            <div class="otp-value">${otp}</div>
          </div>
          <p class="text">
            This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone — our team will never ask you for it.
          </p>
        </div>
        <div class="footer">
          <div>Best regards,</div>
          <div><strong>FirgoMart Team</strong></div>
          <div class="meta" style="margin-top:8px;">
            This is an automated message for seller login verification. Please do not reply to this email.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
    `
    await transport.sendMail({
      from,
      to: targetEmail,
      subject,
      text: `Your OTP for seller login is ${otp}. It is valid for 10 minutes.`,
      html,
    })
    const payload: Record<string, unknown> = { success: true }
    if (process.env.NODE_ENV !== "production") payload.otp = otp
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

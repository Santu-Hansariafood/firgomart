import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"
import nodemailer from "nodemailer"

type UserDoc = {
  email: string
  resetOtp?: string
  resetOtpExpires?: Date
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
    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const u = result.user as unknown as UserDoc
    const { randomBytes } = await import("crypto")
    const token = randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)
    u.resetOtp = token
    u.resetOtpExpires = expires
    await u.save()

    const normalized = String(u.email || email).trim().toLowerCase()
    const transport = createTransport()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || normalized
    const origin = (() => {
      try {
        return new URL(request.url).origin
      } catch {
        return ""
      }
    })()
    const appUrl =
      (process.env.NODE_ENV === "production"
        ? (process.env.NEXT_PUBLIC_APP_URL || origin || "").replace(/\/+$/, "")
        : (origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, ""))
    const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(
      normalized
    )}`
    const subject = "FirgoMart | Reset your password"
    const logoUrl =
      process.env.NEXT_PUBLIC_LOGO_URL ||
      (appUrl ? `${appUrl}/logo.png` : "")
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
      .content { padding: 24px; }
      .greeting { font-size: 14px; margin-bottom: 8px; color: #111827; }
      .text { font-size: 13px; line-height: 1.6; color: #4b5563; margin: 0 0 8px 0; }
      .button-wrap { margin: 24px 0; text-align: center; }
      .button { display: inline-block; padding: 12px 20px; border-radius: 9999px; background: linear-gradient(135deg, #2563eb, #22c55e); color: #f9fafb; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35); }
      .link { font-size: 11px; color: #6b7280; word-break: break-all; margin-top: 10px; }
      .footer { padding: 16px 24px 22px 24px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; font-size: 11px; color: #6b7280; line-height: 1.5; }
      .meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }
      @media (max-width: 600px) {
        .container { border-radius: 0; }
        .header { padding: 20px 18px 16px 18px; }
        .content { padding: 18px; }
        .footer { padding: 14px 18px 18px 18px; }
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
                  ? `<img src="${logoUrl}" alt="FirgoMart" width="32" height="32" style="display:block;border-radius:9999px;" />`
                  : `<span>F</span>`
              }
            </div>
            <div>
              <div style="font-size:16px;font-weight:600;">FirgoMart</div>
              <div style="font-size:11px;opacity:0.9;">Smart marketplace for modern shoppers</div>
            </div>
          </div>
          <div class="title">Reset your password</div>
          <div class="subtitle">Click the button below to securely choose a new password for your account.</div>
        </div>
        <div class="content">
          <p class="greeting">Hi there,</p>
          <p class="text">
            We received a request to reset the password for your <strong>FirgoMart</strong> account associated with this email address.
          </p>
          <div class="button-wrap">
            <a href="${resetLink}" class="button">Reset Password</a>
            <div class="link">${resetLink}</div>
          </div>
          <p class="text">
            This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email and your current password will remain active.
          </p>
        </div>
        <div class="footer">
          <div>Best regards,</div>
          <div><strong>FirgoMart Team</strong></div>
          <div class="meta" style="margin-top:8px;">
            This is an automated message for password reset. Please do not reply to this email.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
    `
    const text = `We received a request to reset your FirgoMart account password.

If you made this request, click the link below to choose a new password:

${resetLink}

This link is valid for 1 hour. If you did not request a password reset, you can ignore this email.`

    try {
      await transport.sendMail({
        from,
        to: normalized,
        subject,
        text,
        html,
      })
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        const reason = err instanceof Error ? err.message : "unknown"
        return NextResponse.json({ error: "Failed to send email", reason }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

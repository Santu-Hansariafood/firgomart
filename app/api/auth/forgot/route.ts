import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"
import nodemailer from "nodemailer"
import { getCommonEmailTemplate } from "@/lib/email/templates"

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
    const html = getCommonEmailTemplate({
      title: "Reset your password",
      greeting: "Hi there",
      message: "We received a request to reset the password for your <strong>FirgoMart</strong> account associated with this email address.",
      actionLink: resetLink,
      actionText: "Reset Password",
      expiryText: "This link is valid for 1 hour.",
      warningText: "If you did not request a password reset, you can safely ignore this email and your current password will remain active."
    })
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

import { NextResponse } from "next/server"
import { findUserAcrossDBs, getUserModel } from "@/lib/models/User"
import nodemailer from "nodemailer"
import { connectDB } from "@/lib/db/db"
import { hash } from "bcryptjs"
import { getCommonEmailTemplate } from "@/lib/email/templates"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!allow.length && process.env.NODE_ENV !== "production") return !!email
  return !!(email && allow.includes(email.toLowerCase()))
}

function createTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || "465")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
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
    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Not an admin email" }, { status: 403 })
    }
    let result = await findUserAcrossDBs(email)
    
    if (!result) {
      try {
        const conn = await connectDB()
        const User = getUserModel(conn)
        let user = await User.findOne({ email })
        
        if (!user) {
          const passwordHash = await hash("admin-auto-created", 10)
          user = await User.create({
            email,
            name: "Admin",
            passwordHash,
          })
        }
        result = { conn, User, user }
      } catch (e) {
        console.error("Failed to auto-create admin user", e)
      }
    }

    if (!result) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }
    
    let otp = Math.floor(100000 + Math.random() * 900000).toString()



    const expires = new Date(Date.now() + 10 * 60 * 1000)
    const u = result.user as any
    u.adminLoginOtp = otp
    u.adminLoginOtpExpires = expires
    await u.save()

    const transport = createTransport()
    if (transport) {
      try {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || "info@firgomart.com"
        await transport.sendMail({
          from: `"FirgoMart Security" <${from}>`,
          to: email,
          subject: "🔐 Admin Login Verification - FirgoMart",
          text: `Your OTP for admin login is ${otp}. It is valid for 10 minutes.`,
          html: getCommonEmailTemplate({
            title: "Admin Access Verification",
            greeting: "Hello Administrator",
            message: "Use the One-Time Password (OTP) below to access your admin dashboard.",
            otp: otp,
            expiryText: "This OTP is valid for 10 minutes."
          }),
        })
      } catch (e) {
        console.error("Failed to send admin OTP email", e)
      }
    } else {
        console.warn("SMTP transport not configured, skipping email send")
    }

    const payload: Record<string, unknown> = { success: true }
    return NextResponse.json(payload, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

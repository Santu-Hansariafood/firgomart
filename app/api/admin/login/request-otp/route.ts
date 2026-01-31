import { NextResponse } from "next/server"
import { findUserAcrossDBs, getUserModel } from "@/lib/models/User"
import nodemailer from "nodemailer"
import { connectDB } from "@/lib/db/db"
import { hash } from "bcryptjs"

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

function getEmailTemplate(otp: string) {
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || "https://firgomart.com/logo/firgomart.png"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://firgomart.com"
  const currentYear = new Date().getFullYear()

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login OTP</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eeeeee; padding-bottom: 20px; }
        .logo { max-width: 150px; height: auto; }
        .content { text-align: center; padding: 0 20px; }
        .otp-box { background-color: #f8f9fa; border: 1px dashed #ced4da; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; display: inline-block; margin: 20px 0; border-radius: 6px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 20px; }
        .warning { font-size: 13px; color: #666666; margin-top: 20px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUrl}" alt="FirgoMart" class="logo">
        </div>
        <div class="content">
            <h2 style="color: #0f172a; margin-bottom: 10px;">Admin Access Verification</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #555555;">
                Hello Administrator,<br>
                Use the One-Time Password (OTP) below to access your admin dashboard.
            </p>
            
            <div class="otp-box">${otp}</div>
            
            <p style="font-size: 14px; color: #666666;">
                This OTP is valid for <strong>10 minutes</strong>.<br>
                Please do not share this code with anyone.
            </p>

            <div class="warning">
                If you did not request this OTP, please contact support immediately or ignore this email.
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${currentYear} FirgoMart. All rights reserved.</p>
            <p>
                <a href="${appUrl}" style="color: #0f172a; text-decoration: none;">Visit Website</a> | 
                <a href="${appUrl}/privacy-policy" style="color: #0f172a; text-decoration: none;">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
  `
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
      // Auto-create admin user if they are in the allowed list but not in DB
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
          html: getEmailTemplate(otp),
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

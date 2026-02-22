import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import nodemailer from "nodemailer"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import { getCommonEmailTemplate } from "@/lib/email/templates"

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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const rawEmail = (session?.user as { email?: string | null } | null)?.email || ""
    const email = rawEmail.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = (session?.user as { role?: string | null } | null)?.role || ""
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)

    const isAdmin = adminEmails.includes(email) || String(role || "").toLowerCase() === "admin"
    if (isAdmin) {
      return NextResponse.json({ error: "Admin accounts cannot be deleted" }, { status: 403 })
    }

    let reason = ""
    try {
      const body = await request.json()
      if (body && typeof body.reason === "string") {
        reason = body.reason.trim()
      }
    } catch {}

    const userResult = await findUserAcrossDBs(email)
    const displayName =
      ((userResult?.user as { name?: string | null } | null)?.name || (session?.user as { name?: string | null } | null)?.name || "there").toString()

    try {
      const transport = createTransport()
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || email
      const subjectRequest = "FirgoMart | Account deletion request received"
      const messageLines = [
        "We have received your request to delete your FirgoMart account.",
        "Your account is scheduled to be deleted and the process may take up to 7 days.",
        "You will receive another email once the deletion is complete.",
      ]
      const message = messageLines.join(" ")
      const htmlRequest = getCommonEmailTemplate({
        title: "Account deletion request received",
        greeting: `Hi ${displayName}`,
        message,
        expiryText: "We usually process deletion requests within 7 days.",
        warningText: "If you did not request this, please contact our support team immediately.",
      })
      const textRequest = `${message}\n\nIf you did not request this, please contact our support team immediately.`
      await transport.sendMail({
        from,
        to: email,
        subject: subjectRequest,
        text: textRequest,
        html: htmlRequest,
      })
    } catch {}

    if (userResult?.user) {
      await (userResult.user as any).deleteOne()
    }

    try {
      const sellerResult = await findSellerAcrossDBs({ email })
      if (sellerResult?.seller) {
        await (sellerResult.seller as any).deleteOne()
      }
    } catch {}

    try {
      const transport = createTransport()
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || email
      const subjectDeleted = "FirgoMart | Account deleted"
      const messageDeleted = "Your FirgoMart account associated with this email address has now been permanently deleted. Thank you for being with us."
      const htmlDeleted = getCommonEmailTemplate({
        title: "Your account has been deleted",
        greeting: `Hi ${displayName}`,
        message: messageDeleted,
        expiryText: "",
        warningText: "If this was not expected, please contact our support team.",
      })
      const textDeleted = `${messageDeleted}\n\nIf this was not expected, please contact our support team.`
      await transport.sendMail({
        from,
        to: email,
        subject: subjectDeleted,
        text: textDeleted,
        html: htmlDeleted,
      })
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: "Failed to delete account", details: message }, { status: 500 })
  }
}

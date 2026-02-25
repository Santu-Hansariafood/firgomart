import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getSupportTicketModel } from "@/lib/models/SupportTicket"
import nodemailer from "nodemailer"
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

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    let adminEmail: string | null = session?.user?.email || null
    let allowed = isAdminEmail(adminEmail)

    if (!allowed) {
      const cookieHeader = request.headers.get("cookie") || ""
      const match = cookieHeader.split(/;\s*/).find(p => p.startsWith("admin_session="))
      if (match) {
        const val = match.split("=")[1] || ""
        const [email, sig] = val.split(".")
        const crypto = await import("crypto")
        const secret = process.env.NEXTAUTH_SECRET || "dev-secret"
        const expected = crypto.createHmac("sha256", secret).update(String(email)).digest("hex")
        if (sig === expected && isAdminEmail(email)) {
          allowed = true
          adminEmail = email
        }
      }
    }

    if (!allowed) {
      const hdrEmail = request.headers.get("x-admin-email")
      if (hdrEmail && isAdminEmail(hdrEmail)) {
        allowed = true
        adminEmail = hdrEmail
      }
    }

    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await ctx.params
    const body = await request.json()
    const message = String(body?.message || "").trim()
    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 })

    const conn = await connectDB()
    const Ticket = getSupportTicketModel(conn)
    const ticket = await (Ticket as any).findById(id).lean()
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const toEmail = String(ticket.buyerEmail || "").trim()
    if (!toEmail) return NextResponse.json({ error: "Ticket has no email" }, { status: 400 })

    const note = {
      text: `Reply: ${message}`,
      author: adminEmail || "admin",
      time: new Date(),
    }

    await (Ticket as any).findByIdAndUpdate(id, { $push: { notes: note } }, { new: true }).lean()

    try {
      const transport = createTransport()
      const from = process.env.SMTP_FROM || process.env.SMTP_USER || toEmail
      const subject = ticket.subject ? `FirgoMart | Reply to your enquiry: ${ticket.subject}` : "FirgoMart | Reply to your enquiry"
      const safeMessage = message.replace(/\n/g, "<br />")
      const html = getCommonEmailTemplate({
        title: "Reply to your enquiry",
        greeting: "Hi there",
        message: `We have replied to your enquiry on <strong>FirgoMart</strong>.<br /><br />${safeMessage}`,
        expiryText: "",
        warningText: "",
      })
      await transport.sendMail({
        from,
        to: toEmail,
        subject,
        text: message,
        html,
      })
    } catch (e) {
      const reason = e instanceof Error ? e.message : "unknown"
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Email send failed", reason }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


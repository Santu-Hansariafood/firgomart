import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getSellerModel } from "@/lib/models/Seller"
import nodemailer from "nodemailer"
import PDFDocument from "pdfkit"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  return !!(email && allow.includes(email.toLowerCase()))
}

async function requireAdmin(request: NextRequest) {
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

  return allowed ? adminEmail : null
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

type SellerDoc = {
  _id?: { toString(): string }
  businessName?: string
  ownerName?: string
  email?: string
  phone?: string
  address?: string
  country?: string
  state?: string
  district?: string
  city?: string
  pincode?: string
  gstNumber?: string
  panNumber?: string
  aadhaar?: string
  hasGST?: boolean
  businessLogoUrl?: string
  documentUrls?: string[]
  bankAccount?: string
  bankIfsc?: string
  bankName?: string
  bankBranch?: string
  bankDocumentUrl?: string
  status?: string
  reviewNotes?: string
  rejectionReason?: string
  reviewedBy?: string
  reviewedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

async function sendApprovalEmail(doc: SellerDoc) {
  const targetEmail = String(doc.email || "").trim().toLowerCase()
  if (!targetEmail) return
  const transport = createTransport()
  if (!transport) return
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || targetEmail
  const appUrlRaw = process.env.NEXT_PUBLIC_APP_URL || ""
  const appUrl = appUrlRaw.replace(/\/+$/, "")
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || (appUrl ? `${appUrl}/logo.png` : "")
  const business = doc.businessName || "Seller"
  const subject = "FirgoMart | Seller registration approved"
  const safePayload = {
    businessName: doc.businessName || "",
    ownerName: doc.ownerName || "",
    email: doc.email || "",
    phone: doc.phone || "",
    address: doc.address || "",
    country: doc.country || "",
    state: doc.state || "",
    district: doc.district || "",
    city: doc.city || "",
    pincode: doc.pincode || "",
    hasGST: !!doc.hasGST,
    gstNumber: doc.gstNumber || "",
    panNumber: doc.panNumber || "",
    aadhaar: doc.aadhaar || "",
    bank: {
      name: doc.bankName || "",
      branch: doc.bankBranch || "",
      account: doc.bankAccount || "",
      ifsc: doc.bankIfsc || "",
    },
    status: doc.status || "",
    reviewNotes: doc.reviewNotes || "",
    rejectionReason: doc.rejectionReason || "",
    reviewedBy: doc.reviewedBy || "",
    reviewedAt: doc.reviewedAt || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  }
  const jsonString = JSON.stringify(safePayload, null, 2)
  const pdf = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []
  pdf.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
  const pdfDone = new Promise<void>((resolve) => pdf.on("end", () => resolve()))
  pdf.fontSize(20).fillColor("#111827").text("Seller Registration Approval", { align: "left" })
  pdf.moveDown(0.5)
  pdf.fontSize(11).fillColor("#374151").text(`Business: ${safePayload.businessName || "—"}`)
  pdf.text(`Owner: ${safePayload.ownerName || "—"}`)
  pdf.text(`Email: ${safePayload.email || "—"}`)
  pdf.text(`Phone: ${safePayload.phone || "—"}`)
  pdf.moveDown(0.5)
  pdf.text("Address:", { continued: false })
  pdf.text(
    `${safePayload.address || ""}${safePayload.city ? `, ${safePayload.city}` : ""}${safePayload.state ? `, ${safePayload.state}` : ""}${safePayload.pincode ? `, ${safePayload.pincode}` : ""}${
      safePayload.country ? `, ${safePayload.country}` : ""
    }`,
    { width: pdf.page.width - 100 }
  )
  pdf.moveDown(0.5)
  pdf.text(`Has GST: ${safePayload.hasGST ? "Yes" : "No"}`)
  pdf.text(`GST Number: ${safePayload.gstNumber || "—"}`)
  pdf.text(`PAN Number: ${safePayload.panNumber || "—"}`)
  pdf.text(`Aadhaar: ${safePayload.aadhaar || "—"}`)
  pdf.moveDown(0.5)
  pdf.text("Bank Details:")
  pdf.text(`Bank: ${safePayload.bank.name || "—"}`)
  pdf.text(`Branch: ${safePayload.bank.branch || "—"}`)
  pdf.text(`Account: ${safePayload.bank.account || "—"}`)
  pdf.text(`IFSC: ${safePayload.bank.ifsc || "—"}`)
  pdf.moveDown(0.5)
  pdf.text(`Status: ${safePayload.status || "—"}`)
  if (safePayload.reviewNotes) {
    pdf.text(`Review Notes: ${safePayload.reviewNotes}`)
  }
  if (safePayload.reviewedBy) {
    pdf.text(`Reviewed By: ${safePayload.reviewedBy}`)
  }
  if (safePayload.reviewedAt) {
    pdf.text(`Reviewed At: ${new Date(safePayload.reviewedAt).toLocaleString()}`)
  }
  pdf.moveDown(1)
  pdf.fontSize(10).fillColor("#6b7280").text("This document confirms that your seller registration with FirgoMart has been approved.", {
    width: pdf.page.width - 100,
  })
  pdf.end()
  await pdfDone
  const pdfBuffer = Buffer.concat(chunks)
  const prettyJsonHtml = jsonString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
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
      .container { max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 35px rgba(15, 23, 42, 0.12); }
      .header { background: linear-gradient(135deg, #16a34a, #22c55e); padding: 24px 24px 20px 24px; color: #f9fafb; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .logo-circle { width: 40px; height: 40px; border-radius: 9999px; background: rgba(15, 23, 42, 0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .logo-circle span { font-weight: 700; font-size: 20px; }
      .title { font-size: 18px; font-weight: 600; margin-top: 8px; }
      .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
      .content { padding: 24px; color: #111827; background-color: #ffffff; }
      .greeting { font-size: 15px; margin-bottom: 8px; }
      .text { font-size: 14px; line-height: 1.55; color: #4b5563; margin: 6px 0; }
      .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; padding: 6px 10px; border-radius: 9999px; background-color: #dcfce7; color: #166534; margin-bottom: 12px; }
      .footer { padding: 16px 24px 20px 24px; font-size: 11px; color: #6b7280; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
      .meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }
      pre { background-color: #0f172a; color: #e5e7eb; padding: 12px; border-radius: 8px; font-size: 11px; overflow-x: auto; }
      @media (max-width: 600px) {
        .container { border-radius: 0; }
        .content { padding: 20px 16px; }
        .header { padding: 20px 16px 18px 16px; }
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
          <div class="title">Seller registration approved</div>
          <div class="subtitle">Your FirgoMart seller account is now active for use.</div>
        </div>
        <div class="content">
          <div class="badge">
            <span>✅</span>
            <span>Approval confirmed</span>
          </div>
          <p class="greeting">Hi ${business},</p>
          <p class="text">
            We are happy to inform you that your <strong>FirgoMart</strong> seller registration request has been approved.
          </p>
          <p class="text">
            You can now log in to your seller account, list products, and start selling on the marketplace in accordance with the FirgoMart Seller Agreement.
          </p>
          <p class="text">
            A PDF summary of your registration details and a JSON copy of the data have been attached to this email for your records.
          </p>
          <p class="text" style="margin-top:12px;margin-bottom:6px;"><strong>Registration snapshot (JSON):</strong></p>
          <pre>${prettyJsonHtml}</pre>
          ${
            appUrl
              ? `<p class="text" style="margin-top:12px;">
            You can access your seller dashboard here:
            <a href="${appUrl}/seller-login" style="color:#2563eb;text-decoration:none;font-weight:500;">${appUrl}/seller-login</a>
          </p>`
              : ""
          }
        </div>
        <div class="footer">
          <div>Best regards,</div>
          <div><strong>FirgoMart Team</strong></div>
          <div class="meta" style="margin-top:8px;">
            This is an automated message regarding your seller registration approval. Please do not reply to this email.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `
  const pdfName = `firgomart-seller-approval-${safePayload.email || safePayload.businessName || "seller"}.pdf`
  const jsonName = `firgomart-seller-details-${safePayload.email || safePayload.businessName || "seller"}.json`
  await transport.sendMail({
    from,
    to: targetEmail,
    subject,
    text: `Your FirgoMart seller registration for ${safePayload.businessName || "your business"} has been approved.`,
    html,
    attachments: [
      {
        filename: pdfName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
      {
        filename: jsonName,
        content: jsonString,
        contentType: "application/json",
      },
    ],
  })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminEmail = await requireAdmin(req)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const conn = await connectDB()
    const Seller = getSellerModel(conn) as {
      findById: (sid: string) => { lean: () => Promise<SellerDoc | null> }
    }
    const doc = await Seller.findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ seller: doc })
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminEmail = await requireAdmin(request)
    if (!adminEmail) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const body = await request.json()
    const allowed: Record<string, unknown> = {}
    const fields = [
      "businessName",
      "ownerName",
      "email",
      "phone",
      "address",
      "country",
      "state",
      "district",
      "city",
      "pincode",
      "gstNumber",
      "panNumber",
      "hasGST",
      "businessLogoUrl",
      "documentUrls",
      "status",
      "reviewNotes",
      "rejectionReason",
      "reviewedAt",
    ]
    for (const key of fields) {
      if (key in body) allowed[key] = body[key]
    }
    allowed["reviewedBy"] = body.reviewedBy || adminEmail
    const conn = await connectDB()
    const Seller = getSellerModel(conn)
    const prev = await (Seller as unknown as {
      findById: (sid: string) => { lean: () => Promise<SellerDoc | null> }
    }).findById(id).lean()
    const doc = await (Seller as unknown as {
      findByIdAndUpdate: (sid: string, update: unknown, opts: { new: boolean }) => {
        lean: () => Promise<SellerDoc | null>
      }
    }).findByIdAndUpdate(id, allowed, { new: true }).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const prevStatus = String(prev?.status || "").toLowerCase()
    const newStatus = String(doc.status || "").toLowerCase()
    if (prevStatus !== "approved" && newStatus === "approved") {
      try {
        await sendApprovalEmail(doc)
      } catch {}
    }
    return NextResponse.json({ seller: doc })
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

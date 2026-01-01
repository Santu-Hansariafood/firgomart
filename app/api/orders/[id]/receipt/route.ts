import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

type OrderItem = { name?: string; quantity?: number; price?: number }
type OrderLean = {
  orderNumber?: string
  status?: string
  buyerName?: string
  buyerEmail?: string
  address?: string
  city?: string
  state?: string
  country?: string
  items?: OrderItem[]
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const url = new URL(request.url)
    const download = (url.searchParams.get("download") || "").toLowerCase() === "true"
    const format = (url.searchParams.get("format") || "html").toLowerCase()
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Product = getProductModel(conn)
    const doc = await (Order as unknown as {
      findById: (id: string) => { lean: () => Promise<OrderLean | null> }
    }).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    let sellerBusiness = ""
    let sellerGST = ""
    let sellerState: string | undefined = undefined
    let logoBuf: Buffer | null = null
    const ADMIN_GST = (process.env.ADMIN_GST_NUMBER || "").trim() || "—"
    try {
      const pid = ((doc.items || [])[0] as unknown as { productId?: unknown })?.productId as { toString?: () => string } | undefined
      const productId = pid?.toString?.() || (pid as unknown as string | undefined)
      if (productId) {
        const p = await (Product as unknown as { findById: (id: string) => { lean: () => Promise<any> } }).findById(productId).lean()
        sellerState = typeof p?.sellerState === "string" ? p.sellerState : undefined
        const sellerEmail = typeof p?.createdByEmail === "string" ? p.createdByEmail : undefined
        if (sellerEmail) {
          const found = await findSellerAcrossDBs({ email: sellerEmail })
          if (found?.seller) {
            const s = found.seller as any
            sellerBusiness = String(s.businessName || "")
            sellerGST = String(s.gstNumber || "")
            if (!sellerState && typeof s.state === "string") sellerState = s.state
          }
        }
      }
    } catch {}
    try {
      logoBuf = fs.readFileSync(path.join(process.cwd(), "public", "logo", "firgomart.png"))
    } catch {}
    const sum = (doc.items || []).reduce((s: number, it: OrderItem) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
    if (format === "pdf") {
      const pdf = new PDFDocument({ size: "A4", margin: 50 })
      const chunks: Buffer[] = []
      pdf.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      const done = new Promise<void>((resolve) => pdf.on("end", () => resolve()))
      if (logoBuf) {
        try { pdf.image(logoBuf, 50, 40, { width: 64 }) } catch {}
      }
      pdf.fontSize(20).fillColor("#000000").text("Receipt", logoBuf ? 120 : 50, logoBuf ? 50 : pdf.y, { align: "left" })
      pdf.fontSize(10).fillColor("#4b5563").text(`FirgoMart 24Logistics Private Limited`, logoBuf ? 120 : 50, pdf.y + 2)
      pdf.fontSize(10).fillColor("#4b5563").text(`Admin GSTIN: ${ADMIN_GST}`, logoBuf ? 120 : 50)
      pdf.moveDown(0.5)
      pdf.fontSize(12).fillColor("#666666").text(`Order Number: ${doc.orderNumber || ""}`)
      pdf.fillColor("#666666").text(`Status: ${doc.status || ""}`)
      pdf.moveDown(0.5)
      pdf.fillColor("#000000")
      pdf.roundedRect(pdf.x, pdf.y, pdf.page.width - 100, 80, 8).stroke("#e5e7eb")
      pdf.moveDown(0.2)
      pdf.text(`Buyer: ${doc.buyerName || ""}${doc.buyerEmail ? ` (${doc.buyerEmail})` : ""}`, { width: pdf.page.width - 100, continued: false })
      pdf.text(`Ship To: ${(doc.address || "")}${doc.city ? `, ${doc.city}` : ""}${doc.state ? `, ${doc.state}` : ""}${(doc as any).pincode ? `, ${(doc as any).pincode}` : ""}${doc.country ? `, ${doc.country}` : ""}`, { width: pdf.page.width - 100 })
      pdf.text(`Seller: ${sellerBusiness || "—"}${sellerGST ? ` • GSTIN: ${sellerGST}` : ""}`, { width: pdf.page.width - 100 })
      pdf.moveDown(0.8)
      const startX = 50
      const colItem = startX
      const colQty = startX + 280
      const colPrice = startX + 340
      const colAmt = startX + 420
      pdf.fontSize(12).fillColor("#000000").text("Item", colItem, pdf.y)
      pdf.text("Qty", colQty, pdf.y)
      pdf.text("Price", colPrice, pdf.y)
      pdf.text("Amount", colAmt, pdf.y)
      pdf.moveTo(startX, pdf.y + 2).lineTo(pdf.page.width - 50, pdf.y + 2).stroke("#e5e7eb")
      let y = pdf.y + 8
      for (const it of (doc.items || [])) {
        const qty = Number(it.quantity || 1)
        const price = Number(it.price || 0)
        const amt = qty * price
        pdf.text(String(it.name || ""), colItem, y, { width: 260 })
        pdf.text(String(qty), colQty, y)
        pdf.text(`₹${price.toFixed(2)}`, colPrice, y)
        pdf.text(`₹${amt.toFixed(2)}`, colAmt, y)
        y += 18
      }
      pdf.moveTo(startX, y + 2).lineTo(pdf.page.width - 50, y + 2).stroke("#e5e7eb")
      const GST_RATE = 0.18
      const buyerState = String(doc.state || "").trim().toLowerCase()
      const sellerSt = String(sellerState || "").trim().toLowerCase()
      let igst = 0, cgst = 0, sgst = 0
      if (buyerState && sellerSt && buyerState !== sellerSt) {
        igst = sum * GST_RATE
      } else {
        cgst = sum * (GST_RATE / 2)
        sgst = sum * (GST_RATE / 2)
      }
      const grand = sum + igst + cgst + sgst
      pdf.fontSize(12).fillColor("#111827").text("Subtotal", colPrice, y + 10)
      pdf.text(`₹${sum.toFixed(2)}`, colAmt, y + 10)
      if (igst > 0) {
        pdf.text("IGST (18%)", colPrice, y + 28)
        pdf.text(`₹${igst.toFixed(2)}`, colAmt, y + 28)
      } else {
        pdf.text("CGST (9%)", colPrice, y + 28)
        pdf.text(`₹${cgst.toFixed(2)}`, colAmt, y + 28)
        pdf.text("SGST (9%)", colPrice, y + 46)
        pdf.text(`₹${sgst.toFixed(2)}`, colAmt, y + 46)
      }
      pdf.font("Helvetica-Bold").text("Total", colPrice, y + (igst > 0 ? 46 : 64))
      pdf.text(`₹${grand.toFixed(2)}`, colAmt, y + (igst > 0 ? 46 : 64))
      pdf.end()
      await done
      const buf = Buffer.concat(chunks)
      const headers: Record<string, string> = { "Content-Type": "application/pdf" }
      const fname = `receipt-${String(doc.orderNumber || id)}.pdf`
      headers["Content-Disposition"] = download ? `attachment; filename="${fname}"` : `inline; filename="${fname}"`
      return new NextResponse(buf, { status: 200, headers })
    }
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt ${doc.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    .muted { color: #6b7280; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .total { font-weight: bold; }
  </style>
</head>
<body>
  <h1>Receipt</h1>
  <div class="muted">Order Number: ${doc.orderNumber}</div>
  <div class="muted">Status: ${doc.status}</div>
  <div class="box">
    <div><strong>Buyer:</strong> ${doc.buyerName || ""} ${doc.buyerEmail ? `(${doc.buyerEmail})` : ""}</div>
    <div><strong>Ship To:</strong> ${doc.address || ""}, ${doc.city || ""}, ${doc.state || ""}, ${doc.country || ""}</div>
  </div>
  <div class="box">
    <table>
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>
      </thead>
      <tbody>
        ${(doc.items || []).map((it: OrderItem) => {
          const qty = Number(it.quantity || 1)
          const price = Number(it.price || 0)
          const amt = qty * price
          return `<tr><td>${it.name}</td><td>${qty}</td><td>₹${price.toFixed(2)}</td><td>₹${amt.toFixed(2)}</td></tr>`
        }).join("")}
        <tr><td colspan="3" class="total">Total</td><td class="total">₹${sum.toFixed(2)}</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`.trim()
    const headers: Record<string, string> = { "Content-Type": "text/html; charset=utf-8" }
    if (download) headers["Content-Disposition"] = `attachment; filename="receipt-${String(doc.orderNumber || id)}.html"`
    return new NextResponse(html, { status: 200, headers })
  } catch (err: unknown) {
    const reason = (err as { message?: string })?.message || "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}


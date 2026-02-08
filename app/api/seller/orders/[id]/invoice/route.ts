import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    const download = (url.searchParams.get("download") || "").toLowerCase() === "true"
    const format = (url.searchParams.get("format") || "json").toLowerCase()
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Product = getProductModel(conn)
    const doc = await (Order as any).findById(id).lean()
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Seller isolation logic
    if (!sellerEmail) return NextResponse.json({ error: "Seller email required" }, { status: 400 })
    const sellerProducts = await (Product as any).find({ createdByEmail: sellerEmail }).select({ _id: 1 }).lean()
    const productIds = sellerProducts.map((p: any) => String(p._id))
    const items = (doc.items || []).filter((it: any) => productIds.includes(String(it.productId)))
    
    // If no items belong to this seller, deny access
    if (!items.length) return NextResponse.json({ error: "Access denied" }, { status: 403 })

    const completed = String(doc.status || "").toLowerCase() === "completed" || doc.completionVerified === true
    if (!completed) return NextResponse.json({ error: "Invoice available after order completion" }, { status: 403 })
    
    const sum = items.reduce((s: number, it: any) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
    
    if (format === "pdf") {
      let sellerBusiness = ""
      let sellerGST = ""
      let sellerState: string | undefined = undefined
      let sellerAddress = ""
      let logoBuf: Buffer | null = null
      const ADMIN_GST = (process.env.ADMIN_GST_NUMBER || "").trim() || "—"
      
      try {
          const found = await findSellerAcrossDBs({ email: sellerEmail })
          if (found?.seller) {
            const s = found.seller as any
            sellerBusiness = String(s.businessName || "")
            sellerGST = String(s.gstNumber || "")
            sellerAddress = [s.address, s.city, s.state, s.pincode].filter((x: string) => !!x).join(", ")
            if (typeof s.state === "string") sellerState = s.state
          }
      } catch {}

      try { logoBuf = fs.readFileSync(path.join(process.cwd(), "public", "logo", "firgomart.png")) } catch {}
      const pdf = new PDFDocument({ size: "A4", margin: 50 })
      const chunks: Buffer[] = []
      pdf.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      const done = new Promise<void>((resolve) => pdf.on("end", () => resolve()))
      if (logoBuf) { try { pdf.image(logoBuf, 50, 40, { width: 64 }) } catch {} }
      pdf.fontSize(20).fillColor("#000000").text("Tax Invoice", logoBuf ? 120 : 50, logoBuf ? 50 : pdf.y, { align: "left" })
      pdf.fontSize(10).fillColor("#4b5563").text(`FirgoMart 24Logistics Private Limited`, logoBuf ? 120 : 50, pdf.y + 2)
      pdf.fontSize(10).fillColor("#4b5563").text(`Admin GSTIN: ${ADMIN_GST}`, logoBuf ? 120 : 50)
      pdf.moveDown(0.5)
      pdf.fontSize(12).fillColor("#666666").text(`Invoice Number: ${doc.orderNumber || ""}`)
      pdf.fillColor("#666666").text(`Status: ${doc.status || ""}`)
      pdf.moveDown(0.5)
      pdf.fillColor("#000000")
      pdf.roundedRect(pdf.x, pdf.y, pdf.page.width - 100, 100, 8).stroke("#e5e7eb")
      pdf.moveDown(0.2)
      pdf.text(`Seller: ${sellerBusiness || "—"}`, { width: pdf.page.width - 100 })
      pdf.text(`Seller GSTIN: ${sellerGST || "—"}`, { width: pdf.page.width - 100 })
      if (sellerAddress) pdf.text(`Seller Address: ${sellerAddress}`, { width: pdf.page.width - 100 })
      pdf.text(`Buyer: ${doc.buyerName || ""}${doc.buyerEmail ? ` (${doc.buyerEmail})` : ""}`, { width: pdf.page.width - 100 })
      pdf.text(`Ship To: ${(doc.address || "")}${doc.city ? `, ${doc.city}` : ""}${doc.state ? `, ${doc.state}` : ""}${(doc as any).pincode ? `, ${(doc as any).pincode}` : ""}${doc.country ? `, ${doc.country}` : ""}`, { width: pdf.page.width - 100 })
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
      for (const it of items) {
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
      const buyerState = String(doc.state || "").trim().toLowerCase()
      const sellerSt = String(sellerState || "").trim().toLowerCase()
      
      let taxTotal = 0
      let useStoredTax = true
      
      for (const it of items) {
         if (typeof it.gstAmount === 'number') {
             taxTotal += it.gstAmount
         } else {
             useStoredTax = false
             break
         }
      }

      // Fallback: check order-level tax if this is a full order
      if (!useStoredTax && items.length === (doc.items || []).length && typeof doc.tax === 'number') {
          taxTotal = doc.tax
          useStoredTax = true
      }

      // Final Fallback: calculate manually
      if (!useStoredTax) {
          const GST_RATE = Number(process.env.GST_PERCENT || process.env.NEXT_PUBLIC_GST_PERCENT || 18) / 100
          taxTotal = sum * GST_RATE
      }

      let igst = 0, cgst = 0, sgst = 0
      if (buyerState && sellerSt && buyerState === sellerSt) {
        cgst = taxTotal / 2
        sgst = taxTotal / 2
      } else {
        igst = taxTotal
      }
      
      let grand = sum + taxTotal
      // Use stored amount if full order to avoid rounding diffs
      if (items.length === (doc.items || []).length && typeof doc.amount === 'number') {
          grand = doc.amount
      }

      pdf.fontSize(12).fillColor("#111827").text("Subtotal", colPrice, y + 10)
      pdf.text(`₹${sum.toFixed(2)}`, colAmt, y + 10)
      if (igst > 0) {
        pdf.text("IGST", colPrice, y + 28)
        pdf.text(`₹${igst.toFixed(2)}`, colAmt, y + 28)
      } else {
        pdf.text("CGST", colPrice, y + 28)
        pdf.text(`₹${cgst.toFixed(2)}`, colAmt, y + 28)
        pdf.text("SGST", colPrice, y + 46)
        pdf.text(`₹${sgst.toFixed(2)}`, colAmt, y + 46)
      }
      pdf.font("Helvetica-Bold").text("Total", colPrice, y + (igst > 0 ? 46 : 64))
      pdf.text(`₹${grand.toFixed(2)}`, colAmt, y + (igst > 0 ? 46 : 64))
      pdf.end()
      await done
      const buf = Buffer.concat(chunks)
      const headers: Record<string, string> = { "Content-Type": "application/pdf" }
      const fname = `invoice-${String(doc.orderNumber || id)}.pdf`
      headers["Content-Disposition"] = download ? `attachment; filename=\"${fname}\"` : `inline; filename=\"${fname}\"`
      return new NextResponse(buf, { status: 200, headers })
    }
    return NextResponse.json({ invoice: { orderNumber: doc.orderNumber, amount: sum, items: doc.items || [], buyer: { email: doc.buyerEmail, name: doc.buyerName } } })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

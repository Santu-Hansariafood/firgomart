import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getPaymentModel } from "@/lib/models/Payment"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
  appliedOffer?: { name: string; value?: number | string; type?: string };
  selectedSize?: string;
  selectedColor?: string;
}

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
  subtotal?: number
  tax?: number
  amount?: number
  pincode?: string
}

function amountInWords(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const two = (n: number) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`
  const three = (n: number) => n < 100 ? two(n) : `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${two(n % 100)}` : ""}`
  const toIndianWords = (n: number) => {
    if (n === 0) return "Zero"
    let s: string[] = []
    let rem = n
    const crore = Math.floor(rem / 10000000)
    rem = rem % 10000000
    const lakh = Math.floor(rem / 100000)
    rem = rem % 100000
    const thousand = Math.floor(rem / 1000)
    rem = rem % 1000
    const hundredRest = rem
    if (crore) s.push(`${three(crore)} Crore`)
    if (lakh) s.push(`${three(lakh)} Lakh`)
    if (thousand) s.push(`${three(thousand)} Thousand`)
    if (hundredRest) s.push(three(hundredRest))
    return s.join(" ")
  }
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  const r = toIndianWords(rupees)
  if (paise > 0) {
    const p = toIndianWords(paise)
    return `Rupees ${r} and ${p} Paise Only`
  }
  return `Rupees ${r} Only`
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
    const Payment = getPaymentModel(conn)
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
        type ProductLean = { sellerState?: string; createdByEmail?: string }
        const p = await (Product as unknown as { findById: (id: string) => { lean: () => Promise<ProductLean | null> } }).findById(productId).lean()
        sellerState = typeof p?.sellerState === "string" ? p!.sellerState : undefined
        const sellerEmail = typeof p?.createdByEmail === "string" ? p!.createdByEmail : undefined
        if (sellerEmail) {
          const found = await findSellerAcrossDBs({ email: sellerEmail })
          if (found?.seller) {
            const s = found.seller as { businessName?: unknown; gstNumber?: unknown; state?: unknown }
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
    let paymentMethod = ""
    let paymentRef = ""
    try {
      const pay = await (Payment as unknown as { findOne: (q: any) => { sort: (s: string) => { lean: () => Promise<any> } } }).findOne({ orderNumber: doc.orderNumber }).sort("-createdAt").lean()
      paymentMethod = String(pay?.method || "")
      paymentRef = String(pay?.transactionId || "")
    } catch {}
    const sum = (doc.items || []).reduce((s: number, it: OrderItem) => s + Number(it.price || 0) * Number(it.quantity || 1), 0)
    if (format === "pdf") {
      const pdf = new PDFDocument({ size: "A4", margin: 50 })
      const chunks: Buffer[] = []
      pdf.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      const done = new Promise<void>((resolve) => pdf.on("end", () => resolve()))
      if (logoBuf) {
        try { pdf.image(logoBuf, 50, 40, { width: 80 }) } catch {}
      }
      pdf.fontSize(20).fillColor("#000000").text("Receipt", logoBuf ? 120 : 50, logoBuf ? 50 : pdf.y, { align: "left" })
      pdf.fontSize(10).fillColor("#4b5563").text(`FirgoMart 24Logistics Private Limited`, logoBuf ? 120 : 50, pdf.y + 2)
      pdf.fontSize(10).fillColor("#4b5563").text(`Admin GSTIN: ${ADMIN_GST}`, logoBuf ? 120 : 50)
      try {
        pdf.save().rect(50, 90, pdf.page.width - 100, 6).fill("#6d28d9").restore()
      } catch {}
      pdf.moveDown(0.5)
      pdf.fontSize(12).fillColor("#666666").text(`Order Number: ${doc.orderNumber || ""}`)
      pdf.fillColor("#666666").text(`Status: ${doc.status || ""}`)
      pdf.moveDown(0.5)
      pdf.fillColor("#000000")
      pdf.roundedRect(pdf.x, pdf.y, pdf.page.width - 100, 80, 8).stroke("#e5e7eb")
      pdf.moveDown(0.2)
      pdf.text(`Buyer: ${doc.buyerName || ""}${doc.buyerEmail ? ` (${doc.buyerEmail})` : ""}`, { width: pdf.page.width - 100, continued: false })
      pdf.text(`Ship To: ${(doc.address || "")}${doc.city ? `, ${doc.city}` : ""}${doc.state ? `, ${doc.state}` : ""}${doc.pincode ? `, ${doc.pincode}` : ""}${doc.country ? `, ${doc.country}` : ""}`, { width: pdf.page.width - 100 })
      pdf.text(`Seller: ${sellerBusiness || "—"}${sellerGST ? ` • GSTIN: ${sellerGST}` : ""}`, { width: pdf.page.width - 100 })
      pdf.text(`Payment Method: ${paymentMethod || "—"}${paymentRef ? ` • Reference No: ${paymentRef}` : ""}`, { width: pdf.page.width - 100 })
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
        
        let extraInfo = ""
        if (it.selectedSize) extraInfo += ` | Size: ${it.selectedSize}`
        if (it.selectedColor) extraInfo += ` | Color: ${it.selectedColor}`
        
        let offerText = ""
        if (it.appliedOffer && it.appliedOffer.value) {
            const val = Number(it.appliedOffer.value)
            if (!isNaN(val) && val > 0 && val < 100) {
                 offerText = `\nOffer: ${it.appliedOffer.name} (${val}% Off)`
            }
        }

        pdf.text(String(it.name || "") + extraInfo + offerText, colItem, y, { width: 260 })
        if (offerText) {
             // Change color for offer text
             // Since pdfkit text flow is continuous, we might need more control if we want color.
             // But simpler is to just append text.
             // If we want color we need separate text calls or rich text (not easily supported in simple pdfkit usage here).
             // We'll stick to text append for simplicity and reliability.
        }
        
        pdf.text(String(qty), colQty, y)
        pdf.text(`₹${price.toFixed(2)}`, colPrice, y)
        pdf.text(`₹${amt.toFixed(2)}`, colAmt, y)
        
        // Calculate height of item text to adjust y
        const textHeight = pdf.heightOfString(String(it.name || "") + extraInfo + offerText, { width: 260 })
        y += Math.max(textHeight, 18) + 4
      }
      pdf.moveTo(startX, y + 2).lineTo(pdf.page.width - 50, y + 2).stroke("#e5e7eb")
      const buyerState = String(doc.state || "").trim().toLowerCase()
      const sellerSt = String(sellerState || "").trim().toLowerCase()
      
      let subtotalVal = Number(doc.subtotal || 0)
      let taxTotal = Number(doc.tax || 0)
      let grand = Number(doc.amount || 0)

      if (!doc.subtotal && !doc.tax) {
         subtotalVal = sum
         const GST_RATE = Number(process.env.GST_PERCENT || process.env.NEXT_PUBLIC_GST_PERCENT || 18) / 100
         if (buyerState && sellerSt && buyerState !== sellerSt) {
             taxTotal = subtotalVal * GST_RATE
         } else {
             taxTotal = subtotalVal * GST_RATE
         }
         if (!grand) grand = subtotalVal + taxTotal
      }

      let igst = 0, cgst = 0, sgst = 0
      if (taxTotal > 0) {
        if (buyerState && sellerSt && buyerState === sellerSt) {
          cgst = taxTotal / 2
          sgst = taxTotal / 2
        } else {
          igst = taxTotal
        }
      }

      pdf.fontSize(12).fillColor("#111827").text("Subtotal", colPrice, y + 10)
      pdf.text(`₹${subtotalVal.toFixed(2)}`, colAmt, y + 10)
      if (igst > 0) {
        pdf.text(`IGST`, colPrice, y + 28)
        pdf.text(`₹${igst.toFixed(2)}`, colAmt, y + 28)
      } else {
        pdf.text(`CGST`, colPrice, y + 28)
        pdf.text(`₹${cgst.toFixed(2)}`, colAmt, y + 28)
        pdf.text(`SGST`, colPrice, y + 46)
        pdf.text(`₹${sgst.toFixed(2)}`, colAmt, y + 46)
      }
      const baseY = y + (igst > 0 ? 46 : 64)
      pdf.font("Helvetica-Bold").text("Total", colPrice, baseY + 18)
      pdf.text(`₹${grand.toFixed(2)}`, colAmt, baseY + 18)
      pdf.moveDown(0.2)
      pdf.fontSize(11).fillColor("#111827").text(`Amount in words: ${amountInWords(grand)}`, 50, pdf.y)
      pdf.moveDown(0.2)
      pdf.fontSize(11).fillColor("#6d28d9").text("Thank you for using FirgoMart platform.", 50, pdf.y)
      pdf.end()
      await done
      const buf = Buffer.concat(chunks)
      const headers: Record<string, string> = { "Content-Type": "application/pdf" }
      const fname = `receipt-${String(doc.orderNumber || id)}.pdf`
      headers["Content-Disposition"] = download ? `attachment; filename="${fname}"` : `inline; filename="${fname}"`
      return new NextResponse(buf, { status: 200, headers })
    }
    const buyerState = String(doc.state || "").trim().toLowerCase()
    const sellerSt = String(sellerState || "").trim().toLowerCase()

    let subtotalVal = Number(doc.subtotal || 0)
    let taxTotal = Number(doc.tax || 0)
    let grand = Number(doc.amount || 0)

    if (!doc.subtotal && !doc.tax) {
       subtotalVal = sum
       const GST_RATE = Number(process.env.GST_PERCENT || process.env.NEXT_PUBLIC_GST_PERCENT || 18) / 100
       if (buyerState && sellerSt && buyerState !== sellerSt) {
           taxTotal = subtotalVal * GST_RATE
       } else {
           taxTotal = subtotalVal * GST_RATE
       }
       if (!grand) grand = subtotalVal + taxTotal
    }

    let igst = 0, cgst = 0, sgst = 0
    if (taxTotal > 0) {
      if (buyerState && sellerSt && buyerState === sellerSt) {
        cgst = taxTotal / 2
        sgst = taxTotal / 2
      } else {
        igst = taxTotal
      }
    }
    
    const qrString = encodeURIComponent(`Order: ${doc.orderNumber || ""}; Status: ${doc.status || ""}; Total: ₹${grand.toFixed(2)}; Email: ${doc.buyerEmail || ""}`)
    const amountWordsText = amountInWords(grand)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt ${doc.orderNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; background: #ffffff; }
    .muted { color: #6b7280; }
    .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .total { font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }
    .letterhead { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-radius: 12px; color: #ffffff; background: linear-gradient(90deg, #6d28d9, #ef4444); }
    .lh-left { display: flex; align-items: center; gap: 12px; }
    .lh-title { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .lh-sub { font-size: 12px; opacity: 0.9; }
    .lh-right { text-align: right; }
    .brand-rule { height: 4px; background: linear-gradient(90deg, #6d28d9, #ef4444); border-radius: 4px; margin: 12px 0 16px; }
    thead th { background: #f5f3ff; color: #4c1d95; }
    .thanks { margin-top: 16px; padding: 10px 12px; border: 1px dashed #e5e7eb; border-radius: 8px; background: #faf5ff; color: #4c1d95; font-weight: 600; }
    .actions { margin-top: 16px; text-align: right; }
    .print-btn { background: #2563eb; color: #ffffff; border: none; border-radius: 8px; padding: 10px 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); cursor: pointer; }
    .print-btn:hover { background: #1e40af; }
    @media print { .actions { display: none; } }
    .qrimg { width: 120px; height: 120px; border-radius: 8px; background: #ffffff; padding: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="letterhead">
    <div class="lh-left">
      <img src="/logo/firgomart.png" alt="FirgoMart" width="64" height="64" />
      <div>
        <div class="lh-title">FirgoMart</div>
        <div class="lh-sub">FirgoMart 24Logistics Private Limited</div>
      </div>
    </div>
    <div class="lh-right">
      <div>Admin GSTIN: ${ADMIN_GST}</div>
      <div>Order: ${doc.orderNumber}</div>
      <div>Status: ${doc.status}</div>
      <img class="qrimg" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrString}" alt="QR Code" />
    </div>
  </div>
  <div class="brand-rule"></div>
  <div class="box grid">
    <div>
      <div><strong>Buyer:</strong> ${doc.buyerName || ""} ${doc.buyerEmail ? `(${doc.buyerEmail})` : ""}</div>
      <div><strong>Ship To:</strong> ${doc.address || ""}, ${doc.city || ""}, ${doc.state || ""}, ${doc.pincode ? `${doc.pincode}, ` : ""}${doc.country || ""}</div>
    </div>
    <div>
      <div><strong>Seller:</strong> ${sellerBusiness || "—"}</div>
      <div><strong>Seller GSTIN:</strong> ${sellerGST || "—"}</div>
      <div class="muted">Scan the QR in header for order details</div>
      <div><strong>Payment Method:</strong> ${paymentMethod || "—"}${paymentRef ? ` • <strong>Reference No:</strong> ${paymentRef}` : ""}</div>
    </div>
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
          let extraInfo = ""
          if (it.selectedSize) extraInfo += ` | Size: ${it.selectedSize}`
          if (it.selectedColor) extraInfo += ` | Color: ${it.selectedColor}`
          
          let offerHtml = ""
          if (it.appliedOffer && it.appliedOffer.value) {
            const val = Number(it.appliedOffer.value)
            if (!isNaN(val) && val > 0 && val < 100) {
               offerHtml = `<div style="font-size:12px;color:#16a34a;margin-top:2px;">Offer: ${it.appliedOffer.name} (${val}% Off)</div>`
            }
          }
          
          return `<tr><td><div>${it.name}${extraInfo ? `<span class="muted" style="font-size:12px;">${extraInfo}</span>` : ""}</div>${offerHtml}</td><td>${qty}</td><td>₹${price.toFixed(2)}</td><td>₹${amt.toFixed(2)}</td></tr>`
        }).join("")}
      </tbody>
    </table>
  </div>
  <div class="box">
    <table>
      <tbody>
        <tr><td>Subtotal</td><td style="text-align:right;">₹${subtotalVal.toFixed(2)}</td></tr>
        ${igst > 0
          ? `<tr><td>IGST</td><td style="text-align:right;">₹${igst.toFixed(2)}</td></tr>`
          : `<tr><td>CGST</td><td style="text-align:right;">₹${cgst.toFixed(2)}</td></tr>
             <tr><td>SGST</td><td style="text-align:right;">₹${sgst.toFixed(2)}</td></tr>`}
        <tr><td class="total">Total</td><td class="total" style="text-align:right;">₹${grand.toFixed(2)}</td></tr>
      </tbody>
    </table>
  </div>
  <div class="box"><div><strong>Amount in words:</strong> ${amountWordsText}</div></div>
  <div class="thanks">Thank you for using FirgoMart platform.</div>
  <div class="actions">
    <button class="print-btn" onclick="window.print()">Print Receipt</button>
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

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getPaymentModel } from "@/lib/models/Payment"
import { getProductModel } from "@/lib/models/Product"
import { getCashfreeOrder } from "@/lib/cashfree"
import type { ClientSession } from "mongoose"
import nodemailer from "nodemailer"

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

async function sendOrderConfirmationEmail(order: any) {
  const buyerEmail = String(order?.buyerEmail || "").trim()
  if (!buyerEmail) return
  const transport = createTransport()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || buyerEmail
  const appUrlRaw = process.env.NEXT_PUBLIC_APP_URL || ""
  const appUrl = appUrlRaw.replace(/\/+$/, "")
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL || (appUrl ? `${appUrl}/logo.png` : "")
  const subject = `FirgoMart | Order confirmed ${order.orderNumber || ""}`.trim()
  const items = Array.isArray(order.items) ? order.items : []
  const currency = "₹"
  const amountNum = Number(order.amount || 0)
  const amountFormatted = `${currency}${amountNum.toFixed(2)}`
  const rows = items
    .map((it: any) => {
      const name = String(it.name || "Item")
      const qty = Number(it.quantity || 0)
      const price = Number(it.price || 0)
      const lineTotal = price * qty
      return `
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#111827;">${name}</td>
              <td style="padding:8px 0;font-size:13px;color:#4b5563;text-align:center;">${qty}</td>
              <td style="padding:8px 0;font-size:13px;color:#4b5563;text-align:right;">${currency}${price.toFixed(2)}</td>
              <td style="padding:8px 0;font-size:13px;color:#111827;text-align:right;font-weight:600;">${currency}${lineTotal.toFixed(2)}</td>
            </tr>`
    })
    .join("")
  const itemsHtml = rows || `
            <tr>
              <td colspan="4" style="padding:8px 0;font-size:13px;color:#6b7280;text-align:left;">Your order details are available in your FirgoMart account.</td>
            </tr>`
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
      .header { background: linear-gradient(135deg, #2563eb, #22c55e); padding: 24px 24px 20px 24px; color: #f9fafb; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .logo-circle { width: 40px; height: 40px; border-radius: 9999px; background: rgba(15, 23, 42, 0.15); display: flex; align-items: center; justify-content: center; overflow: hidden; }
      .logo-circle span { font-weight: 700; font-size: 20px; }
      .title { font-size: 18px; font-weight: 600; margin-top: 8px; }
      .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; }
      .content { padding: 24px; }
      .greeting { font-size: 14px; margin-bottom: 8px; color: #111827; }
      .text { font-size: 13px; line-height: 1.6; color: #4b5563; margin: 0 0 8px 0; }
      .order-box { margin: 18px 0; padding: 16px 18px; border-radius: 12px; background: linear-gradient(135deg, rgba(129, 140, 248, 0.06), rgba(45, 212, 191, 0.12)); border: 1px solid rgba(59, 130, 246, 0.4); }
      .order-meta { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
      .order-id { font-size: 14px; font-weight: 600; color: #111827; }
      .table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      .table th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; text-align: left; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
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
          <div class="title">Order confirmed</div>
          <div class="subtitle">Your payment was successful. Here are your order details.</div>
        </div>
        <div class="content">
          <p class="greeting">Hi${order.buyerName ? ` ${order.buyerName}` : ""},</p>
          <p class="text">
            Thank you for shopping with <strong>FirgoMart</strong>. Your order has been placed successfully and is now being processed.
          </p>
          <div class="order-box">
            <div class="order-meta">Order ID</div>
            <div class="order-id">${order.orderNumber || ""}</div>
            <table class="table">
              <thead>
                <tr>
                  <th style="text-align:left;">Item</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
${itemsHtml}
                <tr>
                  <td colspan="3" style="padding-top:10px;font-size:13px;color:#111827;font-weight:600;text-align:left;">Grand total</td>
                  <td style="padding-top:10px;font-size:13px;color:#111827;font-weight:700;text-align:right;">${amountFormatted}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text">
            You will receive updates when your order is packed and shipped. You can also track your order status from your FirgoMart account.
          </p>
          ${
            appUrl
              ? `<p class="text" style="margin-top:14px;">
            <a href="${appUrl}/profile" style="display:inline-block;padding:10px 16px;border-radius:9999px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;">View your orders</a>
          </p>`
              : ""
          }
        </div>
        <div class="footer">
          <div>Best regards,</div>
          <div><strong>FirgoMart Team</strong></div>
          <div class="meta" style="margin-top:8px;">
            This is an automated message for your recent purchase confirmation. Please do not reply to this email.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `
  const textLines = [
    `Thank you for your order on FirgoMart.`,
    order.orderNumber ? `Order ID: ${order.orderNumber}` : "",
    `Amount: ${amountFormatted}`,
    appUrl ? `You can view your orders at ${appUrl}/profile` : "",
  ].filter(Boolean)
  await transport.sendMail({
    from,
    to: buyerEmail,
    subject,
    text: textLines.join("\n"),
    html,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    const cfOrderIdRaw = String(body.cfOrderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Payment = getPaymentModel(conn)
    const Product = getProductModel(conn)
    const order = await (Order as any).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    const alreadyPaid = String(order.status || "").toLowerCase() === "paid"
    const cfOrderId = cfOrderIdRaw || String(order.orderNumber || "")
    const resp = await getCashfreeOrder(cfOrderId)
    const status = String(resp.order_status || "").toUpperCase()
    if (status === "PAID") {
      const session: ClientSession = await (conn as unknown as { startSession: () => Promise<ClientSession> }).startSession()
      let stockOk = true
      await session.withTransaction(async () => {
        for (const it of (Array.isArray(order.items) ? order.items : [])) {
          const res = await (Product as unknown as {
            updateOne: (filter: unknown, update: unknown, options?: { session?: ClientSession }) => Promise<{ modifiedCount: number }>
          }).updateOne(
            { _id: it.productId, stock: { $gte: it.quantity } },
            { $inc: { stock: -it.quantity } },
            { session }
          )
          if (res.modifiedCount !== 1) {
            stockOk = false
            throw new Error("out_of_stock")
          }
        }
        order.status = "paid"
        order.completedAt = new Date()
        await order.save({ session })
        const paymentsResp = Array.isArray(resp.payments) ? resp.payments : []
        const txnId = String(paymentsResp[0]?.cf_payment_id || resp.cf_order_id || cfOrderId)
        await (Payment as any).create([{
          orderId: order._id,
          orderNumber: order.orderNumber,
          buyerEmail: order.buyerEmail,
          amount: order.amount,
          method: "CASHFREE",
          status: "SUCCESS",
          transactionId: txnId,
          gateway: "CASHFREE",
          settledAt: new Date(),
        }], { session })
      }).catch(async () => {
        stockOk = false
        order.status = "failed"
        await order.save()
      })
      await session.endSession()
      const paymentsResp = Array.isArray(resp.payments) ? resp.payments : []
      if (!stockOk) return NextResponse.json({ status: "failed", error: "Insufficient stock" }, { status: 409 })

      if (!alreadyPaid) {
        try {
          await sendOrderConfirmationEmail(order)
        } catch (e) {
          if (process.env.NODE_ENV !== "production") {
            console.error("Order confirmation email failed", e)
          }
        }
      }

      return NextResponse.json({ status: "confirmed", order: { id: String(order._id), orderNumber: order.orderNumber } })
    }
    return NextResponse.json({ status: "pending" })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

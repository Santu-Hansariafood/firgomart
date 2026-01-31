import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { createCashfreeOrder, cashfreeConfig } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const orderId = String(body.orderId || "")
    if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    type OrderDoc = { orderNumber?: string; amount?: number; buyerEmail?: string; phone?: string }
    const order = await (Order as unknown as { findById: (id: string) => Promise<OrderDoc | null> }).findById(orderId)
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })
    if (!cashfreeConfig.appId || !cashfreeConfig.secretKey) {
      return NextResponse.json({ error: "Cashfree not configured" }, { status: 400 })
    }
    const origin = (() => {
      try { return new URL(request.url).origin } catch { return "" }
    })()
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || origin || "").replace(/\/+$/, "")

    const cfOrderId = String(order.orderNumber || orderId)
    const amount = Number(order.amount || 0)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 })
    }
    type CashfreeCreateResponse = { payment_session_id?: string }
    let resp: CashfreeCreateResponse
    try {
      resp = await createCashfreeOrder({
        orderId: cfOrderId,
        amount,
        customerId: String(order.buyerEmail || cfOrderId),
        customerEmail: String(order.buyerEmail || ""),
        customerPhone: String(order.phone || "9999999999"),
        returnUrl: `${appUrl}/checkout/status?id=${orderId}&order_id={order_id}`,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const m = msg.match(/^\[(\d{3})\]\s*(.*)$/)
      const status = m ? parseInt(m[1], 10) : 500
      let reason = m ? m[2] : msg
      
      if (reason.toLowerCase().includes("ip address is not allowed")) {
        try {
          // Attempt to detect public IP to help the user whitelist it
          const ipRes = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
          const ipData = await ipRes.json();
          if (ipData?.ip) {
             reason += ` Your current public IP is: ${ipData.ip}. Please whitelist this IP in the Cashfree Dashboard.`
          } else {
             reason += ". Please whitelist your server IP in the Cashfree Dashboard."
          }
        } catch {
          reason += ". Please whitelist your server IP in the Cashfree Dashboard."
        }
      }

      const mapped = status >= 500 ? 502 : (status >= 400 ? 400 : 500)
      return NextResponse.json({ error: "Cashfree error", errorText: reason, statusCode: status }, { status: mapped })
    }
    return NextResponse.json({
      paymentSessionId: String(resp.payment_session_id || ""),
      orderId,
      cfOrderId,
      mode: (process.env.CASHFREE_MODE || (process.env.NODE_ENV === "production" ? "production" : "sandbox")).toLowerCase(),
    })
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

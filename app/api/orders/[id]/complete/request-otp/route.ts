import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    let buyerEmail: string | undefined = undefined
    try {
      const body = await request.json()
      buyerEmail = typeof body?.buyerEmail === "string" ? body.buyerEmail : undefined
    } catch {}
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const doc = await (Order as any).findById(id)
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const delivered = String(doc.status || "").toLowerCase() === "delivered"
    if (!delivered) return NextResponse.json({ error: "Order not delivered" }, { status: 400 })
    if (doc.completionVerified) return NextResponse.json({ error: "Already completed" }, { status: 400 })
    if (buyerEmail && String(doc.buyerEmail || "").toLowerCase() !== String(buyerEmail).toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000)
    doc.completionOtp = otp
    doc.completionOtpExpires = expires
    await doc.save()
    const payload: any = { success: true, expiresAt: doc.completionOtpExpires }
    if (process.env.NODE_ENV !== "production") payload.otp = otp
    return NextResponse.json(payload, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const otp = String(body?.otp || "")
    const buyerEmail = typeof body?.buyerEmail === "string" ? body.buyerEmail : undefined
    if (!otp) return NextResponse.json({ error: "Missing otp" }, { status: 400 })
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const doc = await (Order as any).findById(id)
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const delivered = String(doc.status || "").toLowerCase() === "delivered"
    if (!delivered) return NextResponse.json({ error: "Order not delivered" }, { status: 400 })
    if (buyerEmail && String(doc.buyerEmail || "").toLowerCase() !== String(buyerEmail).toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const valid = typeof doc.completionOtp === "string" && doc.completionOtp === otp
    const notExpired = !!doc.completionOtpExpires && new Date(doc.completionOtpExpires).getTime() > Date.now()
    if (!valid || !notExpired) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    doc.completionOtp = undefined
    doc.completionOtpExpires = undefined
    doc.completionVerified = true
    doc.completedAt = new Date()
    doc.status = "completed"
    await doc.save()
    const safe = {
      id: doc._id.toString(),
      orderNumber: doc.orderNumber,
      buyerEmail: doc.buyerEmail,
      status: doc.status,
      completedAt: doc.completedAt,
    }
    return NextResponse.json({ order: safe }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

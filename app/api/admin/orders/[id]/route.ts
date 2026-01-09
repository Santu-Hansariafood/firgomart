import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getShipmentModel } from "@/lib/models/Shipment"
import mongoose from "mongoose"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!allow.length && process.env.NODE_ENV !== "production") return !!email
  return !!(email && allow.includes(email.toLowerCase()))
}

async function authorize(request: Request) {
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

  return { allowed, adminEmail }
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize(request)
    if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    type OrderModelLike = {
      findById: (id: string) => { lean: () => Promise<unknown> }
      findOne: (q: Record<string, unknown>) => { lean: () => Promise<unknown> }
    }
    const OrderM = Order as unknown as OrderModelLike
    let doc: unknown = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await OrderM.findById(id).lean()
    }
    if (!doc) {
      doc = await OrderM.findOne({ orderNumber: id }).lean()
    }
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    const Shipment = getShipmentModel(conn)
    const shipmentDoc = await (Shipment as any).findOne({ orderId: (doc as any)._id }).lean()

    type OrderLean = {
      _id?: { toString?: () => string } | string
      orderNumber?: string
      buyerEmail?: string
      buyerName?: string
      amount?: number
      status?: string
      address?: string
      city?: string
      state?: string
      country?: string
      completionVerified?: boolean
      deliveredAt?: string | Date
      completedAt?: string | Date
      createdAt?: string | Date
      items?: Array<{
        productId?: { toString?: () => string } | string
        name?: string
        quantity: number
        price: number
      }>
    }
    const d = doc as OrderLean
    const safe = {
      id: typeof d._id === "object" && d._id && "toString" in d._id ? (d._id as { toString: () => string }).toString() : String(d._id ?? ""),
      orderNumber: d.orderNumber ?? "",
      buyerEmail: d.buyerEmail ?? "",
      buyerName: d.buyerName ?? "",
      amount: Number(d.amount ?? 0),
      status: d.status ?? "",
      address: d.address ?? "",
      city: d.city ?? "",
      state: d.state ?? "",
      country: d.country ?? "",
      completionVerified: !!d.completionVerified,
      deliveredAt: d.deliveredAt ?? null,
      completedAt: d.completedAt ?? null,
      createdAt: d.createdAt ?? null,
      items: Array.isArray(d.items) ? d.items.map((it) => {
        const pidObj = it.productId as { toString?: () => string } | string | undefined
        const pidStr = typeof pidObj === "object" && pidObj && "toString" in pidObj ? (pidObj as { toString: () => string }).toString() : String(pidObj ?? "")
        return {
          productId: pidStr,
          name: it.name ?? "",
          quantity: Number(it.quantity),
          price: Number(it.price),
        }
      }) : [],
      tracking: shipmentDoc ? {
        trackingNumber: shipmentDoc.trackingNumber,
        courier: shipmentDoc.courier,
        status: shipmentDoc.status
      } : null
    }
    return NextResponse.json({ order: safe })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorize(request)
    if (!auth.allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const { id } = await ctx.params
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const status = String((body as Record<string, unknown>)?.status || "")
    const courier = String((body as Record<string, unknown>)?.courier || "")
    const trackingNumber = String((body as Record<string, unknown>)?.trackingNumber || "")

    const update: Record<string, unknown> = {}
    if (status) update.status = status

    if (!Object.keys(update).length && !courier && !trackingNumber) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Shipment = getShipmentModel(conn)

    type OrderModelLike2 = {
      findByIdAndUpdate: (id: string, u: Record<string, unknown>, opts: Record<string, unknown>) => { lean: () => Promise<unknown> }
      findOneAndUpdate: (q: Record<string, unknown>, u: Record<string, unknown>, opts: Record<string, unknown>) => { lean: () => Promise<unknown> }
      findById: (id: string) => { lean: () => Promise<unknown> }
      findOne: (q: Record<string, unknown>) => { lean: () => Promise<unknown> }
    }
    const OM = Order as unknown as OrderModelLike2
    
    let orderDoc: any = null
    if (Object.keys(update).length > 0) {
      orderDoc = mongoose.Types.ObjectId.isValid(id)
        ? await OM.findByIdAndUpdate(id, update, { new: true }).lean()
        : await OM.findOneAndUpdate({ orderNumber: id }, update, { new: true }).lean()
    } else {
       orderDoc = mongoose.Types.ObjectId.isValid(id)
        ? await OM.findById(id).lean()
        : await OM.findOne({ orderNumber: id }).lean()
    }

    if (!orderDoc) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    // Update Shipment if tracking info provided
    if (courier || trackingNumber) {
       const shipmentUpdate: any = { orderId: orderDoc._id, orderNumber: orderDoc.orderNumber }
       if (courier) shipmentUpdate.courier = courier
       if (trackingNumber) shipmentUpdate.trackingNumber = trackingNumber
       if (status) shipmentUpdate.status = status
       shipmentUpdate.lastUpdate = new Date()
       
       const ShipmentM = Shipment as any
       await ShipmentM.findOneAndUpdate(
         { orderId: orderDoc._id },
         { $set: shipmentUpdate },
         { upsert: true, new: true }
       )
    }

    const d = orderDoc as { _id?: { toString?: () => string } | string; status?: string }
    const idStr = typeof d._id === "object" && d._id && "toString" in d._id ? (d._id as { toString: () => string }).toString() : String(d._id ?? "")
    return NextResponse.json({ order: { id: idStr, status: d.status ?? "" } })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: msg }, { status: 500 })
  }
}

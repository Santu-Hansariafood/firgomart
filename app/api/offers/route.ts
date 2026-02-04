import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOfferModel } from "@/lib/models/Offer"

export async function GET() {
  try {
    const conn = await connectDB()
    const Offer = getOfferModel(conn)
    const docs = await (Offer as any)
      .find({ active: true })
      .sort({ order: 1, name: 1 })
      .lean()
    const offers = (docs as any[]).map((o) => ({
      id: String(o._id),
      key: o.key,
      name: o.name,
      type: o.type,
      value: o.value,
    }))
    return NextResponse.json({ offers })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


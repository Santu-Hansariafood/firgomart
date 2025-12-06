import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"

// Validate whether cart items can be delivered to a given state.
// Request body: { deliverToState: string, items: Array<{ id: string }> }
// Response: { results: Array<{ id: string, deliverable: boolean }> }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const deliverToStateRaw = (body?.deliverToState || "").trim()
    const deliverToState = deliverToStateRaw || ""
    const items = Array.isArray(body?.items) ? body.items : []

    const ids = items
      .map((i: any) => (typeof i?.id === "string" || typeof i?.id === "number") ? String(i.id) : null)
      .filter(Boolean)

    if (!ids.length) {
      return NextResponse.json({ results: [] })
    }

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const products = await Product.find({ _id: { $in: ids } }).lean()

    const resultMap: Record<string, boolean> = {}
    for (const p of products) {
      const isAdminProduct = (p as any).isAdminProduct === true
      const sellerHasGST = (p as any).sellerHasGST === true
      const sellerState = typeof (p as any).sellerState === "string" ? (p as any).sellerState : undefined

      let deliverable = false
      if (isAdminProduct || sellerHasGST) {
        deliverable = true
      } else if (deliverToState && sellerState && sellerState === deliverToState) {
        deliverable = true
      } else {
        deliverable = false
      }
      resultMap[String((p as any)._id)] = deliverable
    }

    const results = ids.map(id => ({ id, deliverable: resultMap[id] ?? false }))
    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getOrderModel } from "@/lib/models/Order"
import type { ClientSession } from "mongoose"

type BodyItem = { id: string | number; quantity: number }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const buyerEmail = typeof body?.buyerEmail === "string" ? body.buyerEmail.trim() : ""
    const buyerName = typeof body?.buyerName === "string" ? body.buyerName.trim() : ""
    const address = typeof body?.address === "string" ? body.address.trim() : ""
    const city = typeof body?.city === "string" ? body.city.trim() : ""
    const state = typeof body?.state === "string" ? body.state.trim() : ""
    const country = typeof body?.country === "string" ? body.country.trim() : "IN"
    const itemsRaw: BodyItem[] = Array.isArray(body?.items) ? body.items : []

    if (!itemsRaw.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const items = itemsRaw.map((it) => ({
      id: String(it.id),
      quantity: Math.max(1, Number(it.quantity || 1)),
    }))

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const Order = getOrderModel(conn)

    const ids = items.map((i) => i.id)
    type ProductLean = { _id: string; name: string; price?: number; stock?: number }
    const products = await (Product as unknown as { find: (q: unknown) => { lean: () => Promise<ProductLean[]> } })
      .find({ _id: { $in: ids } }).lean()
    const prodMap: Record<string, ProductLean> = {}
    for (const p of products as ProductLean[]) {
      prodMap[String(p._id)] = p
    }

    const missing = ids.filter((id) => !prodMap[id])
    if (missing.length) {
      return NextResponse.json({ error: "Some products not found", missing }, { status: 404 })
    }

    for (const it of items) {
      const p = prodMap[it.id]
      const available = Number(p.stock || 0)
      if (available < it.quantity) {
        return NextResponse.json({ error: "Insufficient stock", productId: it.id, available }, { status: 409 })
      }
    }

    const session: ClientSession = await (conn as unknown as { startSession: () => Promise<ClientSession> }).startSession()
    let created: unknown = null
    await session.withTransaction(async () => {
      for (const it of items) {
        const res = await (Product as unknown as {
          updateOne: (filter: unknown, update: unknown, options?: { session?: ClientSession }) => Promise<{ modifiedCount: number }>
        }).updateOne(
          { _id: it.id, stock: { $gte: it.quantity } },
          { $inc: { stock: -it.quantity } },
          { session }
        )
        if (res.modifiedCount !== 1) {
          throw new Error(`out_of_stock:${it.id}`)
        }
      }

      const orderItems = items.map((it) => {
        const p = prodMap[it.id] as ProductLean
        return {
          productId: p._id,
          name: p.name,
          quantity: it.quantity,
          price: Number(p.price ?? 0),
        }
      })
      const amount = orderItems.reduce((s, oi) => s + Number(oi.price) * Number(oi.quantity), 0)

      const docs = await (Order as unknown as {
        create: (arr: unknown[], options?: { session?: ClientSession }) => Promise<unknown[]>
      }).create([{
        buyerEmail: buyerEmail || undefined,
        buyerName: buyerName || undefined,
        items: orderItems,
        amount,
        status: "pending",
        address,
        city,
        state,
        country,
      }], { session })
      created = (docs as unknown[])[0]
    })
    await session.endSession()

    const c = created as { _id?: unknown; orderNumber?: string; status?: string; amount?: number } | null
    let idStr: string | undefined = undefined
    if (c) {
      if (typeof c._id === "string") {
        idStr = c._id
      } else {
        const maybe = c._id as unknown as { toString?: () => string }
        idStr = typeof maybe?.toString === "function" ? maybe.toString() : String(c._id)
      }
    }
    const safe = c ? {
      id: String(idStr),
      orderNumber: c.orderNumber,
      status: c.status,
      amount: c.amount,
    } : null

    return NextResponse.json({ order: safe }, { status: 201 })
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message || "")
    if (msg.startsWith("out_of_stock:")) {
      const productId = msg.split(":")[1]
      return NextResponse.json({ error: "Insufficient stock", productId }, { status: 409 })
    }
    const reason = (err as { message?: string })?.message || "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

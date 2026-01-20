import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getOrderModel } from "@/lib/models/Order"
import categories from "@/data/categories.json"
import type { ClientSession } from "mongoose"

type BodyItem = { id: string | number; quantity: number }

function getGstPercent(categoryKeyOrName?: string): number {
  if (!categoryKeyOrName) return 18
  const normalized = categoryKeyOrName.toLowerCase().trim()
  const cat = categories.categories.find(c => 
    c.key.toLowerCase() === normalized || 
    c.name.toLowerCase() === normalized
  )
  return cat?.gstPercent ?? 18
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const buyerEmail = typeof body?.buyerEmail === "string" ? body.buyerEmail.trim() : ""
    const buyerName = typeof body?.buyerName === "string" ? body.buyerName.trim() : ""
    const address = typeof body?.address === "string" ? body.address.trim() : ""
    const city = typeof body?.city === "string" ? body.city.trim() : ""
    const state = typeof body?.state === "string" ? body.state.trim() : ""
    const pincode = typeof body?.pincode === "string" ? body.pincode.trim() : ""
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
    type ProductLean = { _id: string; name: string; price?: number; stock?: number; height?: number; width?: number; weight?: number; dimensionUnit?: string; weightUnit?: string; category?: string }
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
    
    let totalVolumetricWeight = 0
    let totalActualWeight = 0
    
    for (const it of items) {
      const p = prodMap[it.id]
      let w = Number(p.weight || 0)
      const wUnit = String(p.weightUnit || "kg").toLowerCase().trim()
      if (wUnit === "g") w = w / 1000
      if (wUnit === "mg") w = w / 1000000
      
      const toCm = (v: number, u: string) => {
        const unit = u.toLowerCase().trim()
        if (unit === "m") return v * 100
        if (unit === "mm") return v / 10
        if (unit === "in") return v * 2.54
        if (unit === "ft") return v * 30.48
        return v
      }
      const dUnit = String(p.dimensionUnit || "cm")
      const hCm = toCm(Number(p.height || 0), dUnit)
      const wCm = toCm(Number(p.width || 0), dUnit)
      const depthCm = 10
      
      const vol = (hCm * wCm * depthCm) / 5000
      
      totalActualWeight += (w * it.quantity)
      totalVolumetricWeight += (vol * it.quantity)
    }
    
    const chargeable = Math.max(totalActualWeight, totalVolumetricWeight)
    const deliveryFee = 0

    let subtotal = 0
    let totalTax = 0

    const orderItems = items.map((it) => {
      const p = prodMap[it.id] as ProductLean
      const price = Number(p.price ?? 0)
      const quantity = it.quantity
      const lineTotal = price * quantity
      
      const gstPercent = getGstPercent(p.category)
      const gstAmount = (lineTotal * gstPercent) / 100
      
      subtotal += lineTotal
      totalTax += gstAmount

      return {
        productId: p._id,
        name: p.name,
        quantity,
        price,
        gstPercent,
        gstAmount
      }
    })

    const finalAmount = Number((subtotal + totalTax + deliveryFee).toFixed(2))

    if (body.dryRun) {
      return NextResponse.json({ 
        deliveryFee, 
        subtotal,
        tax: totalTax,
        total: finalAmount,
        items: orderItems.map(i => ({ 
          productId: i.productId, 
          gstPercent: i.gstPercent, 
          gstAmount: i.gstAmount 
        }))
      })
    }

    const docs = await (Order as unknown as {
      create: (arr: unknown[]) => Promise<unknown[]>
    }).create([{
      buyerEmail: buyerEmail || undefined,
      buyerName: buyerName || undefined,
      items: orderItems.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price
      })),
      amount: finalAmount,
      status: "pending",
      address,
      city,
      state,
      pincode,
      country,
      deliveryFee,
    }])
    const created = (docs as unknown[])[0]

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

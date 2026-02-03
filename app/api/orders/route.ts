import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getProductModel } from "@/lib/models/Product"
import { getOrderModel } from "@/lib/models/Order"
import { findUserAcrossDBs } from "@/lib/models/User"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import categories from "@/data/categories.json"
import type { ClientSession } from "mongoose"

type BodyItem = { id: string | number; quantity: number; selectedSize?: string; selectedColor?: string }

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
    const phone = typeof body?.phone === "string" ? body.phone.trim() : ""
    let address = typeof body?.address === "string" ? body.address.trim() : ""
    let city = typeof body?.city === "string" ? body.city.trim() : ""
    let state = typeof body?.state === "string" ? body.state.trim() : ""
    let pincode = typeof body?.pincode === "string" ? body.pincode.trim() : ""
    const country = typeof body?.country === "string" ? body.country.trim() : "IN"

    if ((!address || !city || !state || !pincode) && buyerEmail) {
      try {
        const userRes = await findUserAcrossDBs(buyerEmail)
        if (userRes?.user) {
          const u = userRes.user as any
          const defaultAddr = (u.addresses || []).find((a: any) => a.isDefault)
          if (defaultAddr) {
             if (!address) address = defaultAddr.address || ""
             if (!city) city = defaultAddr.city || ""
             if (!state) state = defaultAddr.state || ""
             if (!pincode) pincode = defaultAddr.pincode || ""
          } else if (u.address) {
             if (!address) address = u.address || ""
             if (!city) city = u.city || ""
             if (!state) state = u.state || ""
             if (!pincode) pincode = u.pincode || ""
          }
        }
      } catch {}
    }
    const itemsRaw: BodyItem[] = Array.isArray(body?.items) ? body.items : []

    if (!itemsRaw.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const items = itemsRaw.map((it) => ({
      id: String(it.id),
      quantity: Math.max(1, Number(it.quantity || 1)),
      selectedSize: typeof it.selectedSize === "string" ? it.selectedSize.trim() : undefined,
      selectedColor: typeof it.selectedColor === "string" ? it.selectedColor.trim() : undefined,
    }))

    const conn = await connectDB()
    const Product = getProductModel(conn)
    const Order = getOrderModel(conn)

    const ids = items.map((i) => i.id)
    type ProductLean = { _id: string; name: string; price?: number; stock?: number; height?: number; width?: number; weight?: number; dimensionUnit?: string; weightUnit?: string; category?: string; sellerState?: string; createdByEmail?: string; gstPercent?: number }
    const products = await (Product as unknown as { find: (q: unknown) => { lean: () => Promise<ProductLean[]> } })
      .find({ _id: { $in: ids } }).lean()
    const prodMap: Record<string, ProductLean> = {}
    
    const sellerStateCache: Record<string, string> = {}
    
    for (const p of products as ProductLean[]) {
      if (!p.sellerState && p.createdByEmail) {
        if (sellerStateCache[p.createdByEmail]) {
          p.sellerState = sellerStateCache[p.createdByEmail]
        } else {
          try {
            const found = await findSellerAcrossDBs({ email: p.createdByEmail })
            if (found?.seller && typeof (found.seller as any).state === "string") {
              const st = (found.seller as any).state
              sellerStateCache[p.createdByEmail] = st
              p.sellerState = st
            }
          } catch {}
        }
      }
      
      prodMap[String(p._id)] = p
    }

    const missing = ids.filter((id) => !prodMap[id])
    if (missing.length) {
      return NextResponse.json({ error: "Some products not found", missing }, { status: 404 })
    }

    for (const it of items) {
      const p = prodMap[it.id]
      const available = Number(p.stock || 0)
      if (available < it.quantity && !body.dryRun) {
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
    let totalCGST = 0
    let totalSGST = 0
    let totalIGST = 0

    const orderItems = items.map((it) => {
      const p = prodMap[it.id] as ProductLean
      const price = Number(p.price ?? 0)
      const quantity = it.quantity
      const lineTotal = price * quantity
      
      const isIndia = country.toLowerCase() === "india" || country.toLowerCase() === "in"

      let gstPercent = 0
      let gstAmount = 0
      let cgst = 0, sgst = 0, igst = 0

      if (isIndia) {
        if (typeof p.gstPercent === "number") {
          gstPercent = p.gstPercent
        } else {
          gstPercent = getGstPercent(p.category)
        }
        gstAmount = Number(((lineTotal * gstPercent) / 100).toFixed(2))
        
        const sellerState = (p.sellerState || "").trim().toLowerCase()
        const buyerStateLower = state.trim().toLowerCase()
        
        if (buyerStateLower && sellerState && buyerStateLower === sellerState) {
          cgst = gstAmount / 2
          sgst = gstAmount / 2
        } else {
          igst = gstAmount
        }
      }
      
      subtotal += lineTotal
      totalTax += gstAmount
      totalCGST += cgst
      totalSGST += sgst
      totalIGST += igst

      return {
        productId: p._id,
        name: p.name,
        quantity,
        price,
        selectedSize: it.selectedSize,
        selectedColor: it.selectedColor,
        gstPercent,
        gstAmount,
        cgst,
        sgst,
        igst,
        stock: Number(p.stock || 0)
      }
    })

    const finalAmount = Number((subtotal + totalTax + deliveryFee).toFixed(2))

    if (body.dryRun) {
      return NextResponse.json({ 
        deliveryFee, 
        subtotal,
        tax: totalTax,
        total: finalAmount,
        taxBreakdown: {
          cgst: totalCGST,
          sgst: totalSGST,
          igst: totalIGST
        },
        items: orderItems.map(i => ({ 
          productId: i.productId, 
          gstPercent: i.gstPercent, 
          gstAmount: i.gstAmount,
          cgst: i.cgst,
          sgst: i.sgst,
          igst: i.igst,
          stock: i.stock
        }))
      })
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingOrder = await (Order as any).findOne({
      buyerEmail: buyerEmail || undefined,
      status: "pending",
      amount: finalAmount,
      createdAt: { $gte: fiveMinutesAgo },
    }).sort({ createdAt: -1 })

    if (existingOrder) {
      if (Array.isArray(existingOrder.items) && existingOrder.items.length === orderItems.length) {
         return NextResponse.json({ order: {
           id: String(existingOrder._id),
           orderNumber: existingOrder.orderNumber,
           status: existingOrder.status,
           amount: existingOrder.amount,
         }}, { status: 201 })
      }
    }

    const docs = await (Order as unknown as {
      create: (arr: unknown[]) => Promise<unknown[]>
    }).create([{
      buyerEmail: buyerEmail || undefined,
      buyerName: buyerName || undefined,
      phone: phone || undefined,
      items: orderItems.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        gstPercent: i.gstPercent,
        gstAmount: i.gstAmount,
      })),
      amount: finalAmount,
      subtotal,
      tax: totalTax,
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

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getCartModel } from "@/lib/models/Cart"
import { getProductModel } from "@/lib/models/Product"

async function resolveOwner() {
  const session = await getServerSession(authOptions)
  if (session?.user && (session.user as any).id) {
    return { ownerType: "user" as const, ownerId: (session.user as any).id as string }
  }
  const store = cookies()
  let id = store.get("cartId")?.value
  if (!id) {
    id = Math.random().toString(36).slice(2)
    store.set("cartId", id, { httpOnly: false, sameSite: "lax", path: "/" })
  }
  return { ownerType: "guest" as const, ownerId: id }
}

export async function POST(request: Request) {
  try {
    const { productId, quantity } = await request.json()
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })
    const qty = Math.max(1, parseInt(String(quantity || 1), 10))

    const { ownerType, ownerId } = await resolveOwner()
    const conn = await connectDB()
    const Cart = getCartModel(conn)
    const Product = getProductModel(conn)
    let cart = await Cart.findOne({ ownerType, ownerId })
    if (!cart) cart = await Cart.create({ ownerType, ownerId, items: [] })

    const p = await Product.findById(productId).lean()
    if (!p) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const idx = cart.items.findIndex((i: any) => i.productId === productId)
    if (idx >= 0) {
      cart.items[idx].quantity = (cart.items[idx].quantity || 1) + qty
    } else {
      cart.items.push({
        productId: String(p._id),
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.image,
        quantity: qty,
      })
    }
    await cart.save()
    return NextResponse.json({ cart: cart.toObject() })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

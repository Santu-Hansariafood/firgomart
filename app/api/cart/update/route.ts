import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getCartModel } from "@/lib/models/Cart"

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
    if (!productId || typeof quantity !== "number") {
      return NextResponse.json({ error: "productId and quantity required" }, { status: 400 })
    }
    const qty = Math.max(0, quantity)

    const { ownerType, ownerId } = await resolveOwner()
    const conn = await connectDB()
    const Cart = getCartModel(conn)
    const cart = await Cart.findOne({ ownerType, ownerId })
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 })

    const idx = cart.items.findIndex((i: any) => i.productId === productId)
    if (idx < 0) return NextResponse.json({ error: "Item not found" }, { status: 404 })
    if (qty === 0) {
      cart.items.splice(idx, 1)
    } else {
      cart.items[idx].quantity = qty
    }
    await cart.save()
    return NextResponse.json({ cart: cart.toObject() })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

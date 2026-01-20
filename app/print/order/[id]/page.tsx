import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getProductModel } from "@/lib/models/Product"
import { getShipmentModel } from "@/lib/models/Shipment"
import { findSellerAcrossDBs } from "@/lib/models/Seller"
import OrderPrint from "@/components/print/OrderPrint"
import { isValidObjectId } from "mongoose"

function isAdminEmail(email?: string | null) {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
  const allow = raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
  if (!allow.length && process.env.NODE_ENV !== "production") return !!email
  return !!(email && allow.includes(email.toLowerCase()))
}

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email
  
  if (!userEmail) {
    redirect("/seller-login?next=/print/order/" + id)
  }

  const isAdmin = isAdminEmail(userEmail)
  
  const conn = await connectDB()
  const Order = getOrderModel(conn)
  const Product = getProductModel(conn)
  const Shipment = getShipmentModel(conn)
  
  if (!isValidObjectId(id)) {
    return notFound()
  }

  const order = await (Order as any).findById(id).lean()
  if (!order) return notFound()

  const itemProductIds = (order.items || []).map((it: any) => it.productId)
  const products = await (Product as any).find({ _id: { $in: itemProductIds } }).lean()
  
  const productMap = new Map<string, any>(products.map((p: any) => [String(p._id), p]))
  
  const sellerGroupsMap = new Map<string, any[]>()
  
  for (const item of order.items || []) {
    const prod = productMap.get(String(item.productId))
    const sellerEmail = prod?.createdByEmail || "admin"
    
    if (!isAdmin && sellerEmail !== userEmail) {
        continue
    }

    if (!sellerGroupsMap.has(sellerEmail)) {
      sellerGroupsMap.set(sellerEmail, [])
    }
    sellerGroupsMap.get(sellerEmail)?.push({ ...item, ...prod, quantity: item.quantity, price: item.price })
  }

  const sellerGroups: any[] = []
  
  for (const [email, items] of Array.from(sellerGroupsMap.entries())) {
    let sellerDetails = {
      businessName: "FirgoMart Admin",
      address: "Admin Address",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
      gstNumber: process.env.ADMIN_GST_NUMBER || "Unregistered",
      panNumber: "",
      email
    }
    
    if (email !== "admin") {
        try {
            const found = await findSellerAcrossDBs({ email })
            if (found?.seller) {
                const s = found.seller as any
                sellerDetails = {
                    businessName: s.businessName,
                    address: s.address,
                    city: s.city,
                    state: s.state,
                    pincode: s.pincode,
                    gstNumber: s.gstNumber,
                    panNumber: s.panNumber,
                    email
                }
            }
        } catch {}
    }

    const total = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0)
    const taxable = total / 1.18
    const taxAmt = total - taxable
    
    sellerGroups.push({
      seller: sellerDetails,
      items,
      taxDetails: {
        total,
        taxable,
        cgst: taxAmt / 2,
        sgst: taxAmt / 2,
        igst: 0 
      }
    })
  }

  if (sellerGroups.length === 0) {
     return <div className="p-8 text-center text-red-600">Access Denied: You are not authorized to view this order's print documents.</div>
  }

  const shipment = await (Shipment as any).findOne({ orderId: order._id }).lean()

  return (
    <OrderPrint 
      order={JSON.parse(JSON.stringify(order))} 
      sellerGroups={JSON.parse(JSON.stringify(sellerGroups))}
      shipment={JSON.parse(JSON.stringify(shipment || {}))}
      adminGst={process.env.ADMIN_GST_NUMBER || ""}
    />
  )
}
import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getSupportTicketModel } from "@/lib/models/SupportTicket"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sellerEmail = (url.searchParams.get("sellerEmail") || "").trim()
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10))
    const status = (url.searchParams.get("status") || "").trim()
    const search = (url.searchParams.get("search") || "").trim()
    const conn = await connectDB()
    const Ticket = getSupportTicketModel(conn)
    const q: any = {}
    if (sellerEmail) q.buyerEmail = sellerEmail
    if (status) q.status = status
    if (search) {
      const r = new RegExp(search, "i")
      q.$or = [{ orderNumber: r }, { subject: r }, { message: r }]
    }
    const items = await (Ticket as any).find(q).sort("-createdAt").lean()
    const total = await (Ticket as any).countDocuments(q)
    const start = (page - 1) * limit
    const pageItems = items.slice(start, start + limit)
    return NextResponse.json({ tickets: pageItems, total })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const buyerEmail = String(body?.sellerEmail || body?.email || "")
    const orderNumber = String(body?.orderNumber || "")
    const subject = String(body?.subject || "")
    const message = String(body?.message || "")
    if (!buyerEmail || !subject || !message) return NextResponse.json({ error: "email, subject, message required" }, { status: 400 })
    const conn = await connectDB()
    const Ticket = getSupportTicketModel(conn)
    const doc = await (Ticket as any).create({ buyerEmail, orderNumber, subject, message, status: "open" })
    return NextResponse.json({ ticket: doc.toObject() }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


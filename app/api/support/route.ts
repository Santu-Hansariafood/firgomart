import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getSupportTicketModel } from "@/lib/models/SupportTicket"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body?.name || "").trim()
    const email = String(body?.email || "").trim()
    const subject = String(body?.subject || "").trim()
    const message = String(body?.message || "").trim()

    if (!email || !email.includes("@") || !subject || !message) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const conn = await connectDB()
    const Ticket = getSupportTicketModel(conn)
    const notes = name ? [{ time: new Date(), author: email, text: `Contact name: ${name}` }] : []
    const doc = await (Ticket as any).create({
      buyerEmail: email,
      subject,
      message,
      status: "open",
      priority: "medium",
      notes,
    })

    return NextResponse.json({ ok: true, ticketId: String(doc?._id || doc?.id) })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

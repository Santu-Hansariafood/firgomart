import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { field, value } = body

    if (!field || !value) {
      return NextResponse.json({ error: "Missing field or value" }, { status: 400 })
    }

    const query: { email?: string; phone?: string; gstNumber?: string; panNumber?: string } = {}
    if (field === "email") {
      query.email = String(value).trim().toLowerCase()
    } else if (field === "phone") {
      query.phone = String(value).replace(/\D/g, "")
    } else if (field === "gstNumber") {
      query.gstNumber = String(value).trim().toUpperCase()
    } else if (field === "panNumber") {
      query.panNumber = String(value).trim().toUpperCase()
    } else {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 })
    }

    const result = await findSellerAcrossDBs(query)

    if (result) {
      return NextResponse.json({ exists: true })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error("Check exists error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { field, value } = body

    if (!field || !value) {
      return NextResponse.json({ error: "Missing field or value" }, { status: 400 })
    }

    const query: any = {}
    if (field === 'email') query.email = value
    else if (field === 'phone') query.phone = value
    else if (field === 'gstNumber') query.gstNumber = value
    else if (field === 'panNumber') query.panNumber = value
    else {
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

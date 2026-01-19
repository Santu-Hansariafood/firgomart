import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { field, value } = body

    if (!field || !value) {
      return NextResponse.json({ error: "Missing field or value" }, { status: 400 })
    }

    const query: Record<string, string> = {}
    if (field === 'email') query.email = value
    else if (field === 'phone') query.mobile = value // Frontend sends 'phone', model uses 'mobile'
    else if (field === 'mobile') query.mobile = value
    else {
        return NextResponse.json({ error: "Invalid field" }, { status: 400 })
    }

    const result = await findUserAcrossDBs(query)

    if (result) {
      return NextResponse.json({ exists: true })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error("Check exists error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

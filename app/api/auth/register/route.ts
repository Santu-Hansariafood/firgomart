import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"
import { hash } from "bcryptjs"

const stateToLocationMap: Record<string, string> = {
  "west bengal": "WB",
  maharashtra: "MH",
  "tamil nadu": "TN",
  delhi: "DL",
  rajasthan: "RJ",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      mobile,
      address,
      city,
      state,
      pincode,
      dateOfBirth,
      gender,
      country,
      location,
    } = body || {}

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let targetCountry = country || "IN"
    let targetLocation = location as string | undefined

    if (targetCountry === "IN" && !targetLocation) {
      const key = (state || "").toLowerCase()
      targetLocation = stateToLocationMap[key]
    }

    let conn
    try {
      if (targetCountry === "IN" && targetLocation) {
        conn = await connectDB("IN", targetLocation)
      } else if (targetCountry === "US") {
        conn = await connectDB("US")
      } else if (targetCountry === "EU") {
        conn = await connectDB("EU")
      } else {
        conn = await connectDB("US")
      }
    } catch (e) {
      conn = await connectDB("US")
    }

    const User = getUserModel(conn)
    const existing = await User.findOne({ email }).lean()
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await hash(password, 10)
    const doc = await User.create({
      name,
      email,
      passwordHash,
      mobile,
      address,
      city,
      state,
      pincode,
      dateOfBirth,
      gender,
      country: targetCountry,
      location: targetCountry === "IN" ? (targetLocation || "default") : "default",
    })

    const safeUser = { id: doc._id.toString(), email: doc.email, name: doc.name }
    return NextResponse.json({ user: safeUser }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}
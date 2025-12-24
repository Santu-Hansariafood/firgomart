import { NextResponse } from "next/server"
import { findUserAcrossDBs } from "@/lib/models/User"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const result = await findUserAcrossDBs(email)
    const exists = !!result
    return NextResponse.json({ exists }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

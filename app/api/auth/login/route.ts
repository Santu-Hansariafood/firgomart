import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { findUserAcrossDBs } from "@/lib/models/User"

type UserDoc = {
  _id: { toString(): string }
  email: string
  name?: string
  passwordHash: string
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }
    const result = await findUserAcrossDBs(email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const u = result.user as unknown as UserDoc
    const hashVal = u.passwordHash
    if (!hashVal || typeof hashVal !== "string") {
      return NextResponse.json({ error: 'Invalid password state' }, { status: 400 })
    }
    const ok = await compare(password, hashVal)
    if (!ok) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
    const safeUser = {
      id: u._id.toString(),
      email: u.email,
      name: u.name,
    }
    return NextResponse.json({ user: safeUser }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

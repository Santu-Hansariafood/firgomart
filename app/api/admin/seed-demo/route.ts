import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"
import { hash } from "bcryptjs"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const emailParam = url.searchParams.get("email") || ""
    const nameParam = url.searchParams.get("name") || "Admin"
    const passwordParam = url.searchParams.get("password") || "TempPass123!"

    const envAdminsRaw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || ""
    const envAdmins = envAdminsRaw.split(",").map(s => s.trim()).filter(Boolean)
    const targetEmail = emailParam || envAdmins[0] || "admin@example.com"

    if (!targetEmail) {
      return NextResponse.json({ error: "No admin email available" }, { status: 400 })
    }

    const conn = await connectDB()
    const User = getUserModel(conn)
    const existingList = await User.find({ email: targetEmail }).lean()
    const existing = existingList[0]
    if (existing) {
      return NextResponse.json({
        success: true,
        created: false,
        user: { id: existing._id, email: existing.email },
      })
    }

    const passwordHash = await hash(passwordParam, 10)
    const doc = await User.create({
      name: nameParam,
      email: targetEmail,
      passwordHash,
      country: "US",
      location: "default",
    })

    const safe = { id: doc._id.toString(), email: doc.email, name: doc.name }
    return NextResponse.json({ success: true, created: true, user: safe }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

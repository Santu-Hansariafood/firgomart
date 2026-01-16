import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"

type MongooseUserDoc = {
  name?: string
  email: string
  mobile?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  save: () => Promise<unknown>
}

function toSafeUser(u: MongooseUserDoc) {
  return {
    name: u.name || "",
    email: u.email,
    mobile: u.mobile || "",
    dateOfBirth: u.dateOfBirth || "",
    gender: u.gender || "",
    address: u.address || "",
    city: u.city || "",
    state: u.state || "",
    pincode: u.pincode || "",
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email || ""
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const result = (await findUserAcrossDBs(email)) as unknown as { user: MongooseUserDoc } | null
    if (!result?.user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ user: toSafeUser(result.user) }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email || ""
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const payload = await request.json()
    const result = (await findUserAcrossDBs(email)) as unknown as { user: MongooseUserDoc } | null
    if (!result?.user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const u = result.user
    const name = typeof payload?.name === "string" ? payload.name : undefined
    const mobile = typeof payload?.mobile === "string" ? payload.mobile : undefined
    const address = typeof payload?.address === "string" ? payload.address : undefined
    const city = typeof payload?.city === "string" ? payload.city : undefined
    const state = typeof payload?.state === "string" ? payload.state : undefined
    const pincode = typeof payload?.pincode === "string" ? payload.pincode : undefined
    const dateOfBirth = typeof payload?.dateOfBirth === "string" ? payload.dateOfBirth : undefined
    const gender = typeof payload?.gender === "string" ? payload.gender : undefined
    if (name !== undefined) u.name = name
    if (mobile !== undefined) u.mobile = mobile
    if (address !== undefined) u.address = address
    if (city !== undefined) u.city = city
    if (state !== undefined) u.state = state
    if (pincode !== undefined) u.pincode = pincode
    if (dateOfBirth !== undefined) u.dateOfBirth = dateOfBirth
    if (gender !== undefined) u.gender = gender
    await u.save()
    return NextResponse.json({ user: toSafeUser(u) }, { status: 200 })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}


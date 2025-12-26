import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await findUserAcrossDBs(session.user.email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user.toObject()
    // Remove sensitive data
    delete u.passwordHash
    delete u.resetOtp
    delete u.resetOtpExpires
    delete u.adminLoginOtp
    delete u.adminLoginOtpExpires

    return NextResponse.json({ user: u })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = await findUserAcrossDBs(session.user.email)
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user
    // Update allowed fields
    const allowed = [
      "name", "mobile", "dateOfBirth", "gender", 
      "address", "city", "state", "pincode", 
      "addresses"
    ]
    
    for (const key of allowed) {
      if (body[key] !== undefined) {
        u[key] = body[key]
      }
    }

    await u.save()
    
    const safe = u.toObject()
    delete safe.passwordHash
    delete safe.resetOtp
    delete safe.resetOtpExpires
    delete safe.adminLoginOtp
    delete safe.adminLoginOtpExpires

    return NextResponse.json({ user: safe })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

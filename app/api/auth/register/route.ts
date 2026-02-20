import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getUserModel, findUserAcrossDBs } from "@/lib/models/User"
import { getEmailOtpModel } from "@/lib/models/EmailOtp"
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

    if (!email || !mobile || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (email) {
      const cross = await findUserAcrossDBs(email, { lean: true })
      if (cross) {
        return NextResponse.json(
          { error: "Email already registered", redirectTo: "/login" },
          { status: 409 }
        )
      }

      const otpConn = await connectDB()
      const EmailOtp = getEmailOtpModel(otpConn)
      const normalizedEmail = String(email).trim().toLowerCase()
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const otpDoc = await (EmailOtp as any).findOne({ email: normalizedEmail, purpose: "user-register" })
      const otpValid =
        otpDoc &&
        otpDoc.verified === true &&
        otpDoc.expiresAt &&
        new Date(otpDoc.expiresAt).getTime() > Date.now()
      if (!otpValid) {
        return NextResponse.json({ error: "Email not verified by OTP" }, { status: 403 })
      }
    }

    if (mobile) {
      const crossMobile = await findUserAcrossDBs({ mobile }, { lean: true })
      if (crossMobile) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        )
      }
    }

    const targetCountry = country || "IN"
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
    } catch {
      conn = await connectDB("US")
    }

    const User = getUserModel(conn)
    if (email) {
      const existing = await User.findOne({ email }).lean()
      if (existing) {
        return NextResponse.json(
          { error: "Email already registered", redirectTo: "/login" },
          { status: 409 }
        )
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile }).lean()
      if (existingMobile) {
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 409 }
        )
      }
    }

    const passwordHash = await hash(password, 10)
    
    const initialAddresses = []
    if (address || city || state || pincode) {
      initialAddresses.push({
        name: name,
        mobile: mobile,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        isDefault: true
      })
    }

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
      addresses: initialAddresses
    })

    const safeUser = { id: doc._id.toString(), email: doc.email, name: doc.name }
    return NextResponse.json({ user: safeUser }, { status: 201 })
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason }, { status: 500 })
  }
}

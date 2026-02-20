import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getSellerModel, findSellerAcrossDBs } from "@/lib/models/Seller"
import { getEmailOtpModel } from "@/lib/models/EmailOtp"

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
      businessName,
      ownerName,
      email,
      phone,
      address,
      country,
      state,
      district,
      city,
      pincode,
      gstNumber,
      panNumber,
      aadhaar,
      hasGST,
      businessLogoUrl,
      documentUrls,
      location,
      bankAccount,
      bankIfsc,
      bankName,
      bankBranch,
      bankDocumentUrl,
    } = body || {}

    if (!businessName || !ownerName || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const normalizedPhone = String(phone).replace(/\D/g, "")
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }
    const otpConn = await connectDB()
    const EmailOtp = getEmailOtpModel(otpConn)
    const otpDoc = await EmailOtp.findOne({ email: normalizedEmail, purpose: "seller-register" })
    const otpValid =
      otpDoc &&
      otpDoc.verified === true &&
      otpDoc.expiresAt &&
      new Date(otpDoc.expiresAt).getTime() > Date.now()
    if (!otpValid) {
      return NextResponse.json({ error: "Email not verified by OTP" }, { status: 403 })
    }
    const existingByEmail = await findSellerAcrossDBs({ email: normalizedEmail }, { lean: true })
    if (existingByEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const existingByPhone = await findSellerAcrossDBs({ phone: normalizedPhone }, { lean: true })
    if (existingByPhone) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 409 })
    }

    const targetCountry = (country || "IN") as string
    let targetLocation = location as string | undefined
    if (targetCountry === "IN" && !targetLocation) {
      const key = (state || "").toLowerCase()
      targetLocation = stateToLocationMap[key]
    }

    let conn
    try {
      if (targetCountry === "IN" && targetLocation) conn = await connectDB("IN", targetLocation)
      else if (targetCountry === "US") conn = await connectDB("US")
      else if (targetCountry === "EU") conn = await connectDB("EU")
      else conn = await connectDB("US")
    } catch {
      conn = await connectDB("US")
    }

    const Seller = getSellerModel(conn)

    if (gstNumber) {
      const existingByGst = await findSellerAcrossDBs({ gstNumber: String(gstNumber).trim().toUpperCase() }, { lean: true })
      if (existingByGst) {
        return NextResponse.json({ error: "GST Number already registered" }, { status: 409 })
      }
    }

    if (panNumber) {
      const existingByPan = await findSellerAcrossDBs({ panNumber: String(panNumber).trim().toUpperCase() }, { lean: true })
      if (existingByPan) {
        return NextResponse.json({ error: "PAN Number already registered" }, { status: 409 })
      }
    }

    const doc = await Seller.create({
      businessName,
      ownerName,
      email: normalizedEmail,
      phone: normalizedPhone,
      address,
      country: targetCountry,
      state,
      district,
      city,
      pincode,
      gstNumber,
      panNumber,
      aadhaar,
      hasGST: !!hasGST,
      businessLogoUrl,
      documentUrls: Array.isArray(documentUrls) ? documentUrls : [],
      bankAccount,
      bankIfsc,
      bankName,
      bankBranch,
      bankDocumentUrl,
      status: "pending",
    })

    const safe = {
      id: doc._id.toString(),
      businessName: doc.businessName,
      ownerName: doc.ownerName,
      email: doc.email,
      phone: doc.phone,
      businessLogoUrl: doc.businessLogoUrl,
    }
    return NextResponse.json({ seller: safe }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown"
    return NextResponse.json({ error: "Server error", reason: message }, { status: 500 })
  }
}

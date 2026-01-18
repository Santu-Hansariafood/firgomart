import { NextResponse } from "next/server"
import { findSellerAcrossDBs } from "@/lib/models/Seller"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = (url.searchParams.get("email") || "").trim()
    const phone = (url.searchParams.get("phone") || "").trim()
    if (!email && !phone) {
      return NextResponse.json({ error: "email or phone required" }, { status: 400 })
    }
    const result = await findSellerAcrossDBs({ email: email || undefined, phone: phone || undefined })
    if (!result) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }
    const s = result.seller as any
    const safe = {
      id: s._id.toString(),
      businessName: s.businessName,
      ownerName: s.ownerName,
      email: s.email,
      phone: s.phone,
      address: s.address,
      country: s.country,
      state: s.state,
      district: s.district,
      city: s.city,
      pincode: s.pincode,
      gstNumber: s.gstNumber,
      panNumber: s.panNumber,
      hasGST: s.hasGST,
      businessLogoUrl: s.businessLogoUrl,
      documentUrls: Array.isArray(s.documentUrls) ? s.documentUrls : [],
      status: s.status,
      createdAt: s.createdAt,
    }
    return NextResponse.json({ seller: safe }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const email = String(body?.email || "")
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })
    const found = await findSellerAcrossDBs({ email })
    if (!found) return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    const { Seller, seller } = found as { Seller: unknown; seller: { _id?: { toString(): string } } }
    const currentId = seller?._id?.toString() || ""

    const update: Record<string, unknown> = {}
    for (const key of ["businessName","ownerName","phone","address","country","state","district","city","pincode","gstNumber","panNumber","hasGST","businessLogoUrl"]) {
      if (body[key] !== undefined) update[key] = body[key]
    }
    if (Array.isArray(body?.documentUrls)) update.documentUrls = body.documentUrls

    const phone = typeof body?.phone === "string" ? body.phone : undefined
    const gstNumber = typeof body?.gstNumber === "string" ? body.gstNumber : undefined
    const panNumber = typeof body?.panNumber === "string" ? body.panNumber : undefined

    if (phone) {
      const existingByPhone = await (Seller as any).findOne({ phone, _id: { $ne: currentId } }).lean()
      if (existingByPhone) {
        return NextResponse.json({ error: "Phone already registered" }, { status: 409 })
      }
    }

    if (gstNumber) {
      const normalizedGst = gstNumber.trim().toUpperCase()
      const existingByGst = await findSellerAcrossDBs({ gstNumber: normalizedGst })
      if (existingByGst && existingByGst.seller && existingByGst.seller._id?.toString() !== currentId) {
        return NextResponse.json({ error: "GST Number already registered" }, { status: 409 })
      }
      update.gstNumber = normalizedGst
    }

    if (panNumber) {
      const normalizedPan = panNumber.trim().toUpperCase()
      const existingByPan = await findSellerAcrossDBs({ panNumber: normalizedPan })
      if (existingByPan && existingByPan.seller && existingByPan.seller._id?.toString() !== currentId) {
        return NextResponse.json({ error: "PAN Number already registered" }, { status: 409 })
      }
      update.panNumber = normalizedPan
    }

    const doc = await (Seller as any).findOneAndUpdate({ email }, update, { new: true }).lean()
    return NextResponse.json({ seller: doc })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}


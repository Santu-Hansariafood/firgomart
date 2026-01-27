import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAcrossDBs } from "@/lib/models/User"
import { Types } from "mongoose"

type Address = {
  _id?: string
  name?: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  isDefault?: boolean
}

type UserDoc = {
  addresses: Address[]
  save: () => Promise<void>
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await findUserAcrossDBs(session.user.email)
    if (!result?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user as unknown as UserDoc
    return NextResponse.json({ addresses: u.addresses || [] })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, mobile, address, city, state, pincode, isDefault } = body

    if (!address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required address fields" }, { status: 400 })
    }

    const result = await findUserAcrossDBs(session.user.email)
    if (!result?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user as unknown as UserDoc
    if (!u.addresses) u.addresses = []

    // If this is the first address, make it default automatically
    const shouldBeDefault = isDefault || u.addresses.length === 0

    if (shouldBeDefault) {
      u.addresses.forEach(a => a.isDefault = false)
    }

    const newAddress = {
      name: name || session.user.name,
      mobile: mobile || "", // Ideally fetch from user profile if missing
      address,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault
    }

    u.addresses.push(newAddress)
    await u.save()

    return NextResponse.json({ addresses: u.addresses }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, mobile, address, city, state, pincode, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    const result = await findUserAcrossDBs(session.user.email)
    if (!result?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user as unknown as UserDoc
    if (!u.addresses) u.addresses = []

    const addrIndex = u.addresses.findIndex((a: any) => a._id.toString() === id)
    if (addrIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (isDefault) {
      u.addresses.forEach(a => a.isDefault = false)
    }

    const addr = u.addresses[addrIndex]
    if (name) addr.name = name
    if (mobile) addr.mobile = mobile
    if (address) addr.address = address
    if (city) addr.city = city
    if (state) addr.state = state
    if (pincode) addr.pincode = pincode
    if (isDefault !== undefined) addr.isDefault = isDefault

    // Ensure at least one default exists if we just turned off default (though UI usually handles "set as default" logic)
    // If user sets isDefault=false on the only default address, we might be left with no default.
    // Generally, "Make Default" is the action. Unsetting default directly is rare.
    // We'll leave it as is.

    await u.save()

    return NextResponse.json({ addresses: u.addresses })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    const result = await findUserAcrossDBs(session.user.email)
    if (!result?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const u = result.user as unknown as UserDoc
    if (!u.addresses) return NextResponse.json({ addresses: [] })

    const wasDefault = u.addresses.find((a: any) => a._id.toString() === id)?.isDefault

    u.addresses = u.addresses.filter((a: any) => a._id.toString() !== id)

    // If we deleted the default address and there are others, make the first one default
    if (wasDefault && u.addresses.length > 0) {
      u.addresses[0].isDefault = true
    }

    await u.save()

    return NextResponse.json({ addresses: u.addresses })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err.message }, { status: 500 })
  }
}

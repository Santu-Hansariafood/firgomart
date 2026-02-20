import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOfferModel } from "@/lib/models/Offer"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const country = (url.searchParams.get("country") || "").trim()

    const conn = await connectDB()
    const Offer = getOfferModel(conn)

    const query: any = { active: true }
    if (country) {
      query.$or = [
        { availableCountry: country },
        { availableCountry: { $exists: false } },
        { availableCountry: "" },
      ]
    }

    const docs = await (Offer as any)
      .find(query)
      .sort({ order: 1, name: 1 })
      .lean()

    const offers = (docs as any[]).map((o) => ({
      id: String(o._id),
      key: o.key,
      name: o.name,
      type: o.type,
      value: o.value,
      expiryDate: o.expiryDate,
      category: o.category,
      subcategory: o.subcategory,
      backgroundClassName: o.backgroundClassName,
      isFestive: !!o.isFestive,
    }))
    return NextResponse.json(
      { offers },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

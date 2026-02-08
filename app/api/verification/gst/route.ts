import { NextResponse } from "next/server"
import { verifyGST } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const { gstNumber } = await request.json()
    if (!gstNumber) return NextResponse.json({ error: "GST Number is required" }, { status: 400 })
    
    const data = await verifyGST(gstNumber)
    return NextResponse.json(data)
  } catch (error: any) {
    const msg = error.message || "Verification failed";
    const status = msg.includes("[4") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status })
  }
}

import { NextResponse } from "next/server"
import { verifyRazorpayGST } from "@/lib/razorpay"

export async function POST(request: Request) {
  // Verifying GST via Razorpay Logic
  try {
    const { gstNumber } = await request.json()
    if (!gstNumber) return NextResponse.json({ error: "GST Number is required" }, { status: 400 })
    
    const data = await verifyRazorpayGST(gstNumber)
    return NextResponse.json(data)
  } catch (error: any) {
    const msg = error.message || "Verification failed";
    const status = msg.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status })
  }
}

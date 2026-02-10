import { NextResponse } from "next/server"
import { verifyGST } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const { gstNumber } = await request.json()
    if (!gstNumber) return NextResponse.json({ error: "GST Number is required" }, { status: 400 })
    
    const data = await verifyGST(gstNumber)
    
    const result = {
        valid: data.valid,
        gstin: gstNumber,
        legal_name_of_business: data.data?.legal_name || data.legal_name || "",
        trade_name: data.data?.trade_name || data.trade_name || "",
        gstin_status: data.data?.gstin_status || data.status || "Active",
        taxpayer_type: data.data?.taxpayer_type || "Regular",
        center_jurisdiction: data.data?.center_jurisdiction || "",
        state_jurisdiction: data.data?.state_jurisdiction || "",
        date_of_registration: data.data?.date_of_registration || "",
        principal_place_of_business: data.data?.principal_place_of_business || "",
        nature_of_business_activity: data.data?.nature_of_business || [],
        message: "GST Number Verified Successfully",
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    const msg = error.message || "Verification failed";
    const status = msg.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status })
  }
}

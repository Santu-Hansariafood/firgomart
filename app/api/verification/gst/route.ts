import { NextResponse } from "next/server"
import { verifyGST } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const { gstNumber } = await request.json()
    if (!gstNumber) return NextResponse.json({ error: "GST Number is required" }, { status: 400 })
    
    const data = await verifyGST(gstNumber)
    
    const result = {
      valid: data.valid,
      gstin: data.GSTIN || gstNumber,
      legal_name_of_business: data.legal_name_of_business || "",
      trade_name: data.trade_name_of_business || "",
      gstin_status: data.gst_in_status || "Active",
      taxpayer_type: data.taxpayer_type || "Regular",
      center_jurisdiction: data.center_jurisdiction || "",
      state_jurisdiction: data.state_jurisdiction || "",
      date_of_registration: data.date_of_registration || "",
      principal_place_of_business: data.principal_place_address || "",
      nature_of_business_activity: data.nature_of_business_activities || [],
      message: data.message || "GST Number Verified Successfully",
    }
    
    return NextResponse.json(result)
  } catch (error: any) {
    const msg = error.message || "Verification failed";
    const status = msg.includes("Invalid") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status })
  }
}

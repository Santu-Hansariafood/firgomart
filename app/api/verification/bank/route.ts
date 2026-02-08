import { NextResponse } from "next/server"
import { verifyBankAccount } from "@/lib/cashfree"

export async function POST(request: Request) {
  try {
    const { bankAccount, ifsc, name, phone } = await request.json()
    if (!bankAccount || !ifsc || !name || !phone) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    const data = await verifyBankAccount({ bankAccount, ifsc, name, phone })
    return NextResponse.json(data)
  } catch (error: any) {
    const msg = error.message || "Verification failed";
    const status = msg.includes("[4") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status })
  }
}

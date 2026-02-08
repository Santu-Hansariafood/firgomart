import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "IFSC Code is required" }, { status: 400 })
  }

  try {
    const res = await fetch(`https://ifsc.razorpay.com/${code}`)
    if (!res.ok) {
        return NextResponse.json({ error: "Invalid IFSC Code" }, { status: 404 })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch IFSC details" }, { status: 500 })
  }
}

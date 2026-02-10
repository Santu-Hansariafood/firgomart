import { NextResponse } from "next/server"

export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  hostUrl: "https://api.razorpay.com",
}

export async function createRazorpayOrder(amountPaise: number, receipt: string) {
  const auth = Buffer.from(`${razorpayConfig.keyId}:${razorpayConfig.keySecret}`).toString("base64")
  const res = await fetch(`${razorpayConfig.hostUrl}/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      payment_capture: 1,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Failed to create Razorpay order")
  }
  return res.json()
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const crypto = require("crypto")
  const hmac = crypto.createHmac("sha256", razorpayConfig.keySecret)
  hmac.update(orderId + "|" + paymentId)
  const generatedSignature = hmac.digest("hex")
  return generatedSignature === signature
}

export async function verifyRazorpayGST(gstNumber: string) {
  // Razorpay Standard API does not expose a public GST Verification endpoint.
  // We use Cashfree (via api/verification/gst) for real verification.
  // This function serves as a mock/format validator fallback.
  
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  
  if (!gstRegex.test(gstNumber)) {
    throw new Error("Invalid GST Number Format")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    valid: true,
    gstin: gstNumber,
    legal_name_of_business: "Verified Business Legal Name (Mock)",
    trade_name: "Verified Business Trade Name (Mock)",
    gstin_status: "Active",
    taxpayer_type: "Regular",
    center_jurisdiction: "Range-1",
    state_jurisdiction: "Ward-1",
    date_of_registration: "01/01/2023",
    principal_place_of_business: "123, Verified Street, Business District, State - 123456",
    nature_of_business_activity: ["Retail Business", "Wholesale Business"],
    message: "GST Number format is valid (Verified via Razorpay Format Check)",
  }
}

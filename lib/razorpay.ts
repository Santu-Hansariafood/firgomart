import crypto from "crypto"

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

export async function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const hmac = crypto.createHmac("sha256", razorpayConfig.keySecret)
  hmac.update(`${orderId}|${paymentId}`)
  const expected = hmac.digest("hex")
  return expected === signature
}

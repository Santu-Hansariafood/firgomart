function normalizeVersion(v?: string) {
  const s = String(v || "").trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [d, m, y] = s.split("-")
    return `${y}-${m}-${d}`
  }
  return "2023-08-01"
}

export const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID || "",
  secretKey: process.env.CASHFREE_SECRET_KEY || "",
  apiVersion: normalizeVersion(process.env.CASHFREE_API_VERSION),
  mode: ((process.env.CASHFREE_MODE && (process.env.CASHFREE_MODE === "production" ? "production" : "sandbox")) ||
    (process.env.NODE_ENV === "production" ? "production" : "sandbox")) as "production" | "sandbox",
}

function getHost() {
  return cashfreeConfig.mode === "production" ? "https://api.cashfree.com" : "https://sandbox.cashfree.com"
}

export async function createCashfreeOrder(params: {
  orderId: string
  amount: number
  currency?: string
  customerId?: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  returnUrl: string
}) {
  const host = getHost()
  const res = await fetch(`${host}/pg/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": cashfreeConfig.apiVersion,
      "x-client-id": cashfreeConfig.appId,
      "x-client-secret": cashfreeConfig.secretKey,
    },
    body: JSON.stringify({
      order_id: params.orderId,
      order_amount: Number(params.amount),
      order_currency: params.currency || "INR",
      customer_details: {
        customer_id: (params.customerId || params.customerEmail || params.orderId).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50),
        customer_name: params.customerName,
        customer_email: params.customerEmail || "",
        customer_phone: params.customerPhone || "",
      },
      order_meta: {
        return_url: params.returnUrl,
      },
    }),
  })
  if (!res.ok) {
    let message = "Failed to create Cashfree order"
    try {
      const data = await res.json()
      message = data?.message || data?.error || JSON.stringify(data)
    } catch {
      try {
        message = await res.text()
      } catch {}
    }
    throw new Error(`[${res.status}] ${message}`)
  }
  return res.json()
}

export async function getCashfreeOrder(orderId: string) {
  const host = getHost()
  const res = await fetch(`${host}/pg/orders/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-version": cashfreeConfig.apiVersion,
      "x-client-id": cashfreeConfig.appId,
      "x-client-secret": cashfreeConfig.secretKey,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || "Failed to fetch Cashfree order")
  }
  return res.json()
}

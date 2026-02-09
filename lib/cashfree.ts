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

export async function verifyGST(gstNumber: string) {
  const host = getHost()
  console.log(`[Cashfree] Verifying GST ${gstNumber} at ${host}/verification/gstin`)
  const res = await fetch(`${host}/verification/gstin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": cashfreeConfig.appId,
      "x-client-secret": cashfreeConfig.secretKey,
    },
    body: JSON.stringify({ gstin: gstNumber }),
  })
  if (!res.ok) {
    let message = "Failed to verify GST"
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

export async function verifyBankAccount(params: { bankAccount: string, ifsc: string, name: string, phone: string }) {
  const host = getHost()
  const payload = {
    bank_account: params.bankAccount,
    ifsc: params.ifsc,
    name: params.name,
    phone: params.phone
  }
  const headers = {
    "Content-Type": "application/json",
    "x-client-id": cashfreeConfig.appId,
    "x-client-secret": cashfreeConfig.secretKey,
  }

  console.log(`[Cashfree] Verifying Bank Account at ${host}/verification/bank-account/sync`)
  let res = await fetch(`${host}/verification/bank-account/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  // If 404, try V1 endpoint as fallback
  if (res.status === 404) {
     console.log(`[Cashfree] 404 at default endpoint, trying fallback /verification/v1/bank-account/sync`)
     res = await fetch(`${host}/verification/v1/bank-account/sync`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
     })
     
     // If still 404, try Payouts Gamma endpoint (Sandbox specific often) or Payouts V1
     if (res.status === 404 && cashfreeConfig.mode === "sandbox") {
         console.log(`[Cashfree] 404 at V1 endpoint, trying Payouts Gamma endpoint`)
         // Payouts API requires different structure often, but let's try the common validation endpoint
         // Note: Payouts usually runs on payout-api.cashfree.com (Prod) or payout-gamma.cashfree.com (Sandbox)
         const payoutHost = "https://payout-gamma.cashfree.com";
         res = await fetch(`${payoutHost}/payout/v1/validation/bankDetails`, {
            method: "POST",
            headers,
            // Payouts validation payload might be slightly different: name, phone, bankAccount, ifsc
            // The current payload matches standard keys: bank_account, ifsc, name, phone.
            // Payouts API expects: name, phone, bankAccount, ifsc. 
            // Our payload has snake_case keys: bank_account. 
            // Let's adjust payload for Payouts API check
            body: JSON.stringify({
                name: params.name,
                phone: params.phone,
                bankAccount: params.bankAccount,
                ifsc: params.ifsc
            }),
         })
     }
  }

  if (!res.ok) {
    let message = "Failed to verify Bank Account"
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

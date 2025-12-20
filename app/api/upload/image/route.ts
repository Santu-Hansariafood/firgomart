import { NextResponse } from "next/server"

function env(key: string, def?: string) {
  return process.env[key] || def || ""
}

export async function POST(request: Request) {
  try {
    const cloudName = env("CLOUDINARY_CLOUD_NAME")
    const preset = env("CLOUDINARY_UPLOAD_PRESET")
    const apiKey = env("CLOUDINARY_API_KEY")
    const apiSecret = env("CLOUDINARY_API_SECRET")
    if (!cloudName || (!preset && (!apiKey || !apiSecret))) {
      return NextResponse.json({ error: "Cloudinary env not configured" }, { status: 500 })
    }

    const body = await request.json()
    const images: string[] = Array.isArray(body?.images) ? body.images : []
    if (!images.length) return NextResponse.json({ urls: [] })

    const urls: string[] = []
    for (const data of images) {
      const form = new FormData()
      form.append("file", data)
      const timestamp = Math.floor(Date.now() / 1000)
      if (preset) {
        form.append("upload_preset", preset)
      } else {
        form.append("timestamp", String(timestamp))
        form.append("api_key", apiKey)
        const crypto = await import("crypto")
        const toSign = `timestamp=${timestamp}`
        const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex")
        form.append("signature", signature)
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form as any,
      })
      const json = await res.json()
      if (!res.ok) {
        const reason = json?.error?.message || "unknown"
        continue
      }
      urls.push(String(json.secure_url || json.url))
    }
    if (!urls.length) {
      return NextResponse.json({ error: "Upload failed", reason: "no image uploaded" }, { status: 500 })
    }
    return NextResponse.json({ urls })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

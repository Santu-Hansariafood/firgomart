import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getShipmentModel } from "@/lib/models/Shipment"
import { getShiprocketToken, hasShiprocketCredentials } from "@/lib/shiprocket"

function getShiprocketBaseUrl() {
  const raw = process.env.SHIPROCKET_BASE_URL || ""
  const trimmed = raw.trim()
  if (trimmed) return trimmed.replace(/\/+$/, "")
  return "https://apiv2.shiprocket.in"
}

async function fetchShiprocketTracking(awb: string) {
  if (!awb) return null
  if (!hasShiprocketCredentials()) return null
  const token = await getShiprocketToken()
  const base = getShiprocketBaseUrl()
  const res = await fetch(`${base}/v1/external/courier/track/awb/${encodeURIComponent(awb)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) {
    let message = "Shiprocket tracking failed"
    try {
      const data = await res.json()
      message = data?.message || data?.error || message
    } catch {
    }
    throw new Error(`[${res.status}] ${message}`)
  }
  const data = await res.json()
  if (!Array.isArray(data) || !data[0]?.tracking_data) return null
  const trackingData = data[0].tracking_data
  const activities = Array.isArray(trackingData.shipment_track_activities)
    ? trackingData.shipment_track_activities
    : []
  const shipmentTrack = Array.isArray(trackingData.shipment_track) ? trackingData.shipment_track : []
  const primaryTrack = shipmentTrack[0] || {}
  const statusLabel =
    (activities[0] && (activities[0]["sr-status-label"] || activities[0].activity)) ||
    primaryTrack.current_status ||
    ""
  const events = activities.map((act: any) => ({
    time: act.date,
    status: act.activity || act["sr-status-label"] || "",
    location: act.location || "",
    note: act.activity || "",
  }))
  const lastUpdate =
    (activities[0] && activities[0].date) ||
    trackingData.delivered_date ||
    trackingData.etd ||
    null
  const destination =
    primaryTrack.destination ||
    (activities[0] && activities[0].location) ||
    null
  const trackUrl = trackingData.track_url || null

  return {
    status: statusLabel || null,
    events,
    lastUpdate,
    destination,
    trackUrl,
  }
}

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Shipment = getShipmentModel(conn)
    const order = await (Order as any).findById(id).lean()
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const shipment = await (Shipment as any).findOne({ orderId: id }).lean()

    let srStatus: string | null = null
    let srEvents: any[] | null = null
    let srLastUpdate: string | null = null
    let srDestination: string | null = null
    let srTrackUrl: string | null = null

    if (shipment?.trackingNumber && hasShiprocketCredentials()) {
      try {
        const data = await fetchShiprocketTracking(shipment.trackingNumber)
        if (data) {
          srStatus = data.status
          srEvents = data.events
          srLastUpdate = data.lastUpdate
          srDestination = data.destination
          srTrackUrl = data.trackUrl
        }
      } catch {
      }
    }

    const baseTracking = Array.isArray(order.tracking) ? order.tracking : []
    let tracking = baseTracking
    if (srTrackUrl && shipment?.trackingNumber) {
      const exists = baseTracking.some((t: any) => String(t.number) === String(shipment.trackingNumber))
      if (!exists) {
        tracking = [
          ...baseTracking,
          { number: shipment.trackingNumber, url: srTrackUrl },
        ]
      } else {
        tracking = baseTracking.map((t: any) =>
          String(t.number) === String(shipment.trackingNumber) ? { ...t, url: t.url || srTrackUrl } : t
        )
      }
    }

    const payload = {
      orderNumber: order.orderNumber,
      status: srStatus || shipment?.status || order.status,
      trackingNumber: shipment?.trackingNumber || null,
      courier: shipment?.courier || null,
      tracking,
      lastUpdate: srLastUpdate || shipment?.lastUpdate || null,
      events: srEvents || (Array.isArray(shipment?.events) ? shipment.events : []),
      destination: srDestination || shipment?.destination || order.city || order.state || null,
    }
    return NextResponse.json({ tracking: payload })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error", reason: err?.message || "unknown" }, { status: 500 })
  }
}

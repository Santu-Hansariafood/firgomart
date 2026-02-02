import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getOrderModel } from "@/lib/models/Order"
import { getShipmentModel } from "@/lib/models/Shipment"
import { getShiprocketToken, trackShipment } from "@/lib/shiprocket"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Please provide a tracking ID or Order ID" }, { status: 400 })
  }

  try {
    const conn = await connectDB()
    const Order = getOrderModel(conn)
    const Shipment = getShipmentModel(conn)

    // 1. Try to find by Order ID or Order Number
    let awb = query
    let orderDetails = null

    const order = await (Order as any).findOne({
      $or: [{ orderNumber: query }, { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null }]
    }).lean()

    if (order) {
      // If order found, look for shipment
      const shipment = await (Shipment as any).findOne({ orderId: order._id }).lean()
      if (shipment?.trackingNumber) {
        awb = shipment.trackingNumber
      }
      orderDetails = {
        orderId: order.orderNumber,
        status: order.status,
        date: order.createdAt,
        items: order.items?.length || 0
      }
    }

    // 2. Query Shiprocket with AWB
    try {
      const token = await getShiprocketToken()
      const data = await trackShipment(token, awb)
      
      // Parse Shiprocket response
      const trackingData = data?.tracking_data?.shipment_track_activities 
        ? data.tracking_data 
        : (data?.[0]?.tracking_data || null)

      if (!trackingData) {
         // If we found an order but no tracking data yet
         if (orderDetails) {
           return NextResponse.json({ 
             success: true, 
             order: orderDetails, 
             tracking: null,
             message: "Order placed. Tracking details not yet available."
           })
         }
         return NextResponse.json({ error: "Tracking details not found" }, { status: 404 })
      }

      const activities = Array.isArray(trackingData.shipment_track_activities)
        ? trackingData.shipment_track_activities
        : []
        
      const events = activities.map((act: any) => ({
        time: act.date,
        status: act.activity || act["sr-status-label"] || "",
        location: act.location || "",
        note: act.activity || "",
      }))

      const currentStatus = trackingData.current_status || (activities[0] ? activities[0]["sr-status-label"] : "Unknown")

      return NextResponse.json({
        success: true,
        order: orderDetails,
        tracking: {
          awb: trackingData.awb_code || awb,
          courier: trackingData.courier_name || "",
          status: currentStatus,
          events,
          trackUrl: trackingData.track_url || null,
          origin: trackingData.origin || null,
          destination: trackingData.destination || null,
        }
      })

    } catch (err: any) {
      // If Shiprocket fails but we have order details
      if (orderDetails) {
        return NextResponse.json({ 
          success: true, 
          order: orderDetails, 
          tracking: null,
          message: "Tracking information unavailable at the moment."
        })
      }
      return NextResponse.json({ error: "Tracking information not found" }, { status: 404 })
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 })
  }
}

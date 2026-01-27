import { Connection, Schema, Model } from "mongoose"

const TransitEventSchema = new Schema(
  {
    time: { type: Date, required: true },
    status: { type: String, required: true },
    location: { type: String },
    note: { type: String },
  },
  { _id: false }
)

const ShipmentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    orderNumber: { type: String, index: true },
    sellerEmail: { type: String, index: true },
    trackingNumber: { type: String, index: true },
    courier: { type: String, index: true },
    invoiceUrl: { type: String },
    status: { type: String, index: true },
    origin: { type: String },
    destination: { type: String },
    lastUpdate: { type: Date },
    events: { type: [TransitEventSchema], default: [] },
  },
  { timestamps: true }
)

export function getShipmentModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Shipment as Model<unknown> | undefined
  return existing ?? conn.model("Shipment", ShipmentSchema)
}


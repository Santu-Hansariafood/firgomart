import { Connection, Schema, Model, Document } from "mongoose"

export interface IOffer extends Document {
  key: string
  name: string
  type: "discount-min" | "pack-min" | "search" | "category"
  category?: string
  subcategory?: string
  value?: number | string
  active: boolean
  expiryDate?: Date
  order?: number
  createdByEmail?: string
  createdAt?: Date
  updatedAt?: Date
}

const OfferSchema = new Schema<IOffer>(
  {
    key: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["discount-min", "pack-min", "search", "category"] },
    category: { type: String },
    subcategory: { type: String },
    value: { type: Schema.Types.Mixed },
    active: { type: Boolean, default: true, index: true },
    expiryDate: { type: Date },
    order: { type: Number, default: 0, index: true },
    createdByEmail: { type: String, index: true },
  },
  { timestamps: true }
)

export function getOfferModel(conn: Connection): Model<IOffer> {
  const models = conn.models as Record<string, Model<IOffer>>
  const existing = models.Offer
  return existing ?? conn.model<IOffer>("Offer", OfferSchema)
}


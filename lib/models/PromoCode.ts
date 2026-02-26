import { Connection, Schema, Model, Document } from "mongoose"

export interface IPromoCode extends Document {
  code: string
  type: "percent" | "flat"
  value: number
  active: boolean
  availableCountry?: string
  startsAt?: Date
  endsAt?: Date
  maxRedemptions?: number
  maxRedemptionsPerUser?: number
  usageCount: number
  createdByEmail?: string
  createdAt?: Date
  updatedAt?: Date
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ["percent", "flat"], default: "percent" },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true, index: true },
    availableCountry: { type: String, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    maxRedemptions: { type: Number },
    maxRedemptionsPerUser: { type: Number, default: 1 },
    usageCount: { type: Number, default: 0, index: true },
    createdByEmail: { type: String, index: true },
  },
  { timestamps: true }
)

PromoCodeSchema.index({ active: 1, endsAt: 1 })

export function getPromoCodeModel(conn: Connection): Model<IPromoCode> {
  const models = conn.models as Record<string, Model<IPromoCode>>
  const existing = models.PromoCode
  return existing ?? conn.model<IPromoCode>("PromoCode", PromoCodeSchema)
}


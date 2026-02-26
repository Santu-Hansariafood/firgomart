import { Connection, Schema, Model, Document } from "mongoose"

export interface IPromoCodeUsage extends Document {
  code: string
  buyerEmail?: string
  userId?: string
  usedAt: Date
  orderId?: string
}

const PromoCodeUsageSchema = new Schema<IPromoCodeUsage>(
  {
    code: { type: String, required: true, index: true },
    buyerEmail: { type: String, index: true },
    userId: { type: String, index: true },
    usedAt: { type: Date, default: Date.now },
    orderId: { type: String, index: true },
  },
  { timestamps: true }
)

PromoCodeUsageSchema.index({ code: 1, buyerEmail: 1 })
PromoCodeUsageSchema.index({ code: 1, userId: 1 })

export function getPromoCodeUsageModel(conn: Connection): Model<IPromoCodeUsage> {
  const models = conn.models as Record<string, Model<IPromoCodeUsage>>
  const existing = models.PromoCodeUsage
  return existing ?? conn.model<IPromoCodeUsage>("PromoCodeUsage", PromoCodeUsageSchema)
}


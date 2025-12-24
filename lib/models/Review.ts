import { Connection, Schema, Model } from "mongoose"

const ReviewSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, default: "approved" }, // approved, pending, rejected
  },
  { timestamps: true }
)

export function getReviewModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Review as Model<unknown> | undefined
  return existing ?? conn.model("Review", ReviewSchema)
}

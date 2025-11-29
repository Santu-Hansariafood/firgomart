import { Connection, Schema, Model } from "mongoose"

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    description: { type: String },
  },
  { timestamps: true }
)

export function getProductModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Product as Model<unknown> | undefined
  return existing ?? conn.model("Product", ProductSchema)
}

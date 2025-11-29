import { Connection, Schema, Model } from "mongoose"

const CartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
)

const CartSchema = new Schema(
  {
    ownerType: { type: String, enum: ["user", "guest"], required: true },
    ownerId: { type: String, required: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
)

CartSchema.index({ ownerType: 1, ownerId: 1 }, { unique: true })

export function getCartModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Cart as Model<unknown> | undefined
  return existing ?? conn.model("Cart", CartSchema)
}

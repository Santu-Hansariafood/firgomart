import { Connection, Schema, Model } from "mongoose"

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    buyerEmail: { type: String, index: true },
    buyerName: { type: String },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    status: { type: String, default: "pending", index: true },
    address: { type: String },
    city: { type: String },
    state: { type: String, index: true },
    country: { type: String, index: true },
  },
  { timestamps: true }
)

export function getOrderModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Order as Model<unknown> | undefined
  return existing ?? conn.model("Order", OrderSchema)
}


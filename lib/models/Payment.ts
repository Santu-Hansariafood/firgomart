import { Connection, Schema, Model } from "mongoose"

const PaymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    orderNumber: { type: String, index: true },
    buyerEmail: { type: String, index: true },
    amount: { type: Number, required: true },
    method: { type: String, index: true },
    status: { type: String, index: true },
    transactionId: { type: String, index: true },
    gateway: { type: String },
    settledAt: { type: Date },
  },
  { timestamps: true }
)

export function getPaymentModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Payment as Model<unknown> | undefined
  return existing ?? conn.model("Payment", PaymentSchema)
}


import { Connection, Schema, Model, Document } from "mongoose"

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
        selectedSize: { type: String },
        selectedColor: { type: String },
        gstPercent: { type: Number },
        gstAmount: { type: Number },
      },
    ],
    amount: { type: Number, required: true },
    subtotal: { type: Number },
    tax: { type: Number },
    status: { type: String, default: "pending", index: true },
    address: { type: String },
    city: { type: String },
    state: { type: String, index: true },
    pincode: { type: String },
    country: { type: String, index: true },
    tracking: [
      {
        number: { type: String },
        url: { type: String },
      },
    ],
    deliveryFee: { type: Number, default: 0 },
    completionOtp: { type: String },
    completionOtpExpires: { type: Date },
    completionVerified: { type: Boolean, default: false, index: true },
    deliveredAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

type OrderDoc = Document & { orderNumber?: string }

OrderSchema.pre("validate", function (this: OrderDoc, next) {
  if (!this.orderNumber) {
    const dt = new Date()
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, "0")
    const d = String(dt.getDate()).padStart(2, "0")
    const rand = Math.floor(100000 + Math.random() * 900000).toString()
    this.orderNumber = `ORD-${y}${m}${d}-${rand}`
  }
  next()
})

export function getOrderModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Order as Model<unknown> | undefined
  return existing ?? conn.model("Order", OrderSchema)
}

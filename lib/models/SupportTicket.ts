import { Connection, Schema, Model } from "mongoose"

const NoteSchema = new Schema(
  {
    time: { type: Date, required: true },
    author: { type: String },
    text: { type: String, required: true },
  },
  { _id: false }
)

const SupportTicketSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    orderNumber: { type: String, index: true },
    buyerEmail: { type: String, index: true },
    source: { type: String, index: true },
    subject: { type: String },
    message: { type: String },
    status: { type: String, default: "open", index: true },
    priority: { type: String, default: "medium", index: true },
    notes: { type: [NoteSchema], default: [] },
  },
  { timestamps: true }
)

export function getSupportTicketModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.SupportTicket as Model<unknown> | undefined
  return existing ?? conn.model("SupportTicket", SupportTicketSchema)
}


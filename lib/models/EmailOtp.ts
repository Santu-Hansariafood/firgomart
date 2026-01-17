import { Connection, Schema, Model } from "mongoose"

const EmailOtpSchema = new Schema(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

EmailOtpSchema.index({ email: 1, purpose: 1 })

export function getEmailOtpModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.EmailOtp as Model<unknown> | undefined
  return existing ?? conn.model("EmailOtp", EmailOtpSchema)
}


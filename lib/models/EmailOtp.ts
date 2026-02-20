import { Connection, Schema, Model } from "mongoose"

type EmailOtpDoc = {
  email: string
  purpose: string
  code: string
  expiresAt: Date
  verified: boolean
}

const EmailOtpSchema = new Schema<EmailOtpDoc>(
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

export function getEmailOtpModel(conn: Connection): Model<EmailOtpDoc> {
  const models = conn.models as Record<string, Model<EmailOtpDoc>>
  const existing = models.EmailOtp
  return existing ?? conn.model<EmailOtpDoc>("EmailOtp", EmailOtpSchema)
}

import { Connection, Schema, Model, Document } from "mongoose"

export interface IBanner extends Document {
  title: string
  description: string
  buttonText: string
  image: string
  section: string
  linkType: "product" | "category" | "external"
  linkId?: string
  availableCountry?: string
  active: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    buttonText: { type: String, required: true },
    image: { type: String, required: true },
    section: { type: String, default: "hero", index: true },
    linkType: { type: String, enum: ["product", "category", "external"], default: "product" },
    linkId: { type: String },
    availableCountry: { type: String, index: true },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
)

export function getBannerModel(conn: Connection): Model<IBanner> {
  const models = conn.models as Record<string, Model<IBanner>>
  const existing = models.Banner
  return existing ?? conn.model<IBanner>("Banner", BannerSchema)
}

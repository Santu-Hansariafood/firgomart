import { Connection, Schema, Model } from "mongoose"

  const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, index: true },
    subcategory: { type: String, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number },
    height: { type: Number },
    width: { type: Number },
    length: { type: Number },
    weight: { type: Number },
    dimensionUnit: { type: String },
    lengthUnit: { type: String },
    weightUnit: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    hsnCode: { type: String },
    gstNumber: { type: String },
    description: { type: String },
    details: { type: String },
    status: { type: String, default: "approved", index: true },
    stock: { type: Number, default: 0 },
    isAdminProduct: { type: Boolean, default: false, index: true },
    createdByEmail: { type: String, index: true },
    sellerState: { type: String, index: true },
    sellerHasGST: { type: Boolean, default: undefined, index: true },
    brand: { type: String },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    about: { type: String },
    additionalInfo: { type: String },
  },
  { timestamps: true }
)

ProductSchema.index({ name: "text", category: "text", subcategory: "text", brand: "text", description: "text" })

export function getProductModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Product as Model<unknown> | undefined
  return existing ?? conn.model("Product", ProductSchema)
}

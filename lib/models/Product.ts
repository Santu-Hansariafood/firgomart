import { Connection, Schema, Model, Document } from "mongoose"

export interface IProduct extends Document {
  name: string
  image: string
  images: string[]
  category: string
  subcategory?: string
  price: number
  originalPrice?: number
  discount?: number
  height?: number
  width?: number
  length?: number
  weight?: number
  dimensionUnit?: string
  lengthUnit?: string
  weightUnit?: string
  rating: number
  reviews: number
  hsnCode?: string
  gstNumber?: string
  gstPercent?: number
  description?: string
  details?: string
  status: string
  stock: number
  isAdminProduct: boolean
  productId?: string
  createdByEmail?: string
  sellerState?: string
  sellerHasGST?: boolean
  brand?: string
  colors: string[]
  sizes: string[]
  about?: string
  additionalInfo?: string
  unitsPerPack: number
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema = new Schema<IProduct>(
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
    gstPercent: { type: Number },
    description: { type: String },
    details: { type: String },
    status: { type: String, default: "approved", index: true },
    stock: { type: Number, default: 0 },
    isAdminProduct: { type: Boolean, default: false, index: true },
    productId: { type: String, index: true },
    createdByEmail: { type: String, index: true },
    sellerState: { type: String, index: true },
    sellerHasGST: { type: Boolean, default: undefined, index: true },
    brand: { type: String },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    about: { type: String },
    additionalInfo: { type: String },
    unitsPerPack: { type: Number, default: 1 },
  },
  { timestamps: true }
)

ProductSchema.index({ name: "text", category: "text", subcategory: "text", brand: "text", description: "text" })

ProductSchema.index({ category: 1, status: 1, price: 1 })
ProductSchema.index({ category: 1, status: 1, rating: -1 })
ProductSchema.index({ category: 1, status: 1, createdAt: -1 })

ProductSchema.index({ category: 1, subcategory: 1, status: 1, price: 1 })
ProductSchema.index({ category: 1, subcategory: 1, status: 1, rating: -1 })
ProductSchema.index({ category: 1, subcategory: 1, status: 1, createdAt: -1 })

ProductSchema.index({ isAdminProduct: 1, status: 1 })
ProductSchema.index({ sellerHasGST: 1, status: 1 })

export function getProductModel(conn: Connection): Model<IProduct> {
  const models = conn.models as Record<string, Model<IProduct>>
  const existing = models.Product
  return existing ?? conn.model<IProduct>("Product", ProductSchema)
}

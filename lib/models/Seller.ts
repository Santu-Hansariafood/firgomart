import { Connection, Schema, Model } from "mongoose"

type SellerDoc = {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address?: string
  country?: string
  state?: string
  district?: string
  city?: string
  pincode?: string
  gstNumber?: string
  panNumber?: string
  aadhaar?: string
  hasGST: boolean
  businessLogoUrl?: string
  documentUrls: string[]
  bankAccount?: string
  bankIfsc?: string
  bankName?: string
  bankBranch?: string
  bankDocumentUrl?: string
  status: string
  reviewNotes?: string
  rejectionReason?: string
  reviewedBy?: string
  reviewedAt?: Date
  loginOtp?: string
  loginOtpExpires?: Date
  createdAt?: Date
  updatedAt?: Date
}

const SellerSchema = new Schema<SellerDoc>(
  {
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    address: { type: String },
    country: { type: String },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    pincode: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    aadhaar: { type: String },
    hasGST: { type: Boolean, default: true },
    businessLogoUrl: { type: String },
    documentUrls: { type: [String], default: [] },
    bankAccount: { type: String },
    bankIfsc: { type: String },
    bankName: { type: String },
    bankBranch: { type: String },
    bankDocumentUrl: { type: String },
    status: { type: String, default: "pending" },
    reviewNotes: { type: String },
    rejectionReason: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    loginOtp: { type: String },
    loginOtpExpires: { type: Date },
  },
  { timestamps: true }
)

export function getSellerModel(conn: Connection): Model<SellerDoc> {
  const models = conn.models as Record<string, Model<SellerDoc>>
  const existing = models.Seller
  return existing ?? conn.model<SellerDoc>("Seller", SellerSchema)
}

export async function findSellerAcrossDBs(
  identifier: { email?: string; phone?: string; gstNumber?: string; panNumber?: string },
  options?: { lean?: boolean }
) {
  const { email, phone, gstNumber, panNumber } = identifier
  const { connectDB } = await import("@/lib/db/db")
  const conns: Connection[] = []
  try { conns.push(await connectDB("US")) } catch {}
  try { conns.push(await connectDB("EU")) } catch {}
  try { conns.push(await connectDB("IN")) } catch {}
  for (const loc of ["WB", "MH", "TN", "DL", "RJ"]) {
    try { conns.push(await connectDB("IN", loc)) } catch {}
  }
  for (const conn of conns) {
    const Seller = getSellerModel(conn)
    const query: Record<string, string> = {}
    if (email) query.email = email
    if (phone) query.phone = phone
    if (gstNumber) query.gstNumber = gstNumber
    if (panNumber) query.panNumber = panNumber
    
    if (Object.keys(query).length === 0) continue

    const doc = options?.lean
      ? await Seller.findOne(query).lean()
      : await Seller.findOne(query)
    if (doc) return { conn, Seller, seller: doc }
  }
  return null
}

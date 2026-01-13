import { Connection, Schema, Model } from "mongoose"

const SellerSchema = new Schema(
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

export function getSellerModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.Seller as Model<unknown> | undefined
  return existing ?? conn.model("Seller", SellerSchema)
}

export async function findSellerAcrossDBs(identifier: { email?: string; phone?: string; gstNumber?: string; panNumber?: string }) {
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

    const doc = await (Seller as any).findOne(query)
    if (doc) return { conn, Seller, seller: doc }
  }
  return null
}

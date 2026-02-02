import { Connection, Schema } from "mongoose"
import { connectDB } from "@/lib/db/db"

  const UserSchema = new Schema(
    {
      name: { type: String },
      email: { type: String, unique: true, sparse: true },
      passwordHash: { type: String, required: true },
      mobile: { type: String, unique: true, sparse: true },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      dateOfBirth: { type: String },
      gender: { type: String },
      country: { type: String },
      location: { type: String },
      resetOtp: { type: String },
      resetOtpExpires: { type: Date },
      adminLoginOtp: { type: String },
      adminLoginOtpExpires: { type: Date },
      addresses: [{
        name: String,
        mobile: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: Boolean
      }],
      wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      recentlyViewed: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
  )

export function getUserModel(conn: Connection) {
  return conn.models.User || conn.model("User", UserSchema)
}

export async function findUserAcrossDBs(identifier: string | { email?: string, mobile?: string }) {
  const query: Record<string, string> = {}
  if (typeof identifier === "string") {
    if (/^\d{10}$/.test(identifier)) {
      query.mobile = identifier
    } else {
      query.email = identifier
    }
  } else {
    if (identifier.email) query.email = identifier.email
    if (identifier.mobile) query.mobile = identifier.mobile
  }
  
  if (Object.keys(query).length === 0) return null

  const conns: Connection[] = []
  try {
    conns.push(await connectDB())
  } catch {}
  try {
    conns.push(await connectDB("US"))
  } catch {}
  try {
    conns.push(await connectDB("EU"))
  } catch {}
  try {
    conns.push(await connectDB("IN"))
  } catch {}
  for (const loc of ["WB", "MH", "TN", "DL", "RJ"]) {
    try {
      conns.push(await connectDB("IN", loc))
    } catch {}
  }
  for (const conn of conns) {
    const User = getUserModel(conn)
    const user = await User.findOne(query)
    if (user) return { conn, User, user }
  }
  return null
}

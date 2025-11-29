import { Connection, Schema, Model } from "mongoose"
import { connectDB } from "@/lib/db/db"

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String },
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
  },
  { timestamps: true }
)

export function getUserModel(conn: Connection) {
  const models = conn.models as Record<string, Model<unknown>>
  const existing = models.User as Model<unknown> | undefined
  return existing ?? conn.model("User", UserSchema)
}

export async function findUserAcrossDBs(email: string) {
  const conns: Connection[] = []
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
    const user = await User.findOne({ email })
    if (user) return { conn, User, user }
  }
  return null
}

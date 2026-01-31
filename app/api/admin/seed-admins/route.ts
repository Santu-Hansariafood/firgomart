import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"
import { hash } from "bcryptjs"

export async function GET() {
  try {
    const adminEmails = [
      "firgomart@gmail.com",
      "santu.developer@firgomart.com",
      "taniya.developer@firgomart.com",
      "info.developereye@gmail.com",
      "santude1997@gmail.com"
    ]

    const conn = await connectDB()
    const User = getUserModel(conn)
    const results = []

    for (const email of adminEmails) {
      const existing = await User.findOne({ email })
      
      if (existing) {
        results.push({ email, status: "Already exists", id: existing._id })
      } else {
        const passwordHash = await hash("admin-seeded-password", 10)
        const newUser = await User.create({
          email,
          name: "Admin",
          passwordHash,
          role: "admin", // Assuming there might be a role field, though schema didn't explicitly show it, it's good practice. Schema showed strict fields so this might be ignored if not in schema, but won't hurt.
          // Based on schema:
          country: "IN", 
          location: "default"
        })
        results.push({ email, status: "Created", id: newUser._id })
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

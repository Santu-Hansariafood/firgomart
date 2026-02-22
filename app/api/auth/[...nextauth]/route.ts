import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { findUserAcrossDBs } from "@/lib/models/User"
import { connectDB } from "@/lib/db/db"
import { getUserModel } from "@/lib/models/User"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null
        const result = await findUserAcrossDBs(credentials.email)
        if (!result) return null
        type UserDoc = {
          _id: { toString(): string }
          email: string
          name?: string
          passwordHash: string
        }
        const u = result.user as unknown as UserDoc
        const hashVal = u.passwordHash
        if (!hashVal || typeof hashVal !== "string") return null
        const ok = await compare(credentials.password, hashVal)
        if (!ok) return null

        try {
          const conn = await connectDB()
          const User = getUserModel(conn)
          const headers = req?.headers || {}
          const rawForwarded = (headers["x-forwarded-for"] || headers["x-real-ip"]) as string | string[] | undefined
          const ip =
            Array.isArray(rawForwarded)
              ? rawForwarded[0]
              : (rawForwarded || "").split(",")[0].trim()
          const ua = (headers["user-agent"] as string | undefined) || ""
          await User.updateOne(
            { _id: u._id },
            {
              $set: {
                lastLoginAt: new Date(),
                lastLoginIp: ip,
                lastLoginUserAgent: ua,
              },
            }
          )
        } catch {}

        return { id: u._id.toString(), email: u.email, name: u.name }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "id" in user) token.id = (user as { id: string }).id
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.id) (session.user as { id?: string }).id = token.id as string
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

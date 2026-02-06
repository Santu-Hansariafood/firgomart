import { Connection, Schema, Model, Document } from "mongoose"

export interface ITeam extends Document {
  name: string
  role: string
  department: string
  image: string
  bio?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true, index: true },
    image: { type: String, required: true },
    bio: { type: String },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export function getTeamModel(conn: Connection): Model<ITeam> {
  const models = conn.models as Record<string, Model<ITeam>>
  return models.Team ?? conn.model<ITeam>("Team", TeamSchema)
}

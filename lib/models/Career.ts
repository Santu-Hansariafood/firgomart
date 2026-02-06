import { Connection, Schema, Model, Document } from "mongoose"

export interface ICareer extends Document {
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  benefits: string[]
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

const CareerSchema = new Schema<ICareer>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true, index: true },
    location: { type: String, required: true },
    type: { type: String, required: true }, // Full-time, Part-time, Contract
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export function getCareerModel(conn: Connection): Model<ICareer> {
  const models = conn.models as Record<string, Model<ICareer>>
  return models.Career ?? conn.model<ICareer>("Career", CareerSchema)
}

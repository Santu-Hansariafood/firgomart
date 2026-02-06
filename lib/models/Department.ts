import { Connection, Schema, Model, Document } from "mongoose"

export interface IDepartment extends Document {
  name: string
  description: string
  icon: string
  order: number
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export function getDepartmentModel(conn: Connection): Model<IDepartment> {
  const models = conn.models as Record<string, Model<IDepartment>>
  return models.Department ?? conn.model<IDepartment>("Department", DepartmentSchema)
}

import { Connection, Schema, Model, Document } from "mongoose"

export interface IBlog extends Document {
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string
  category: string
  image: string
  tags: string[]
  isPublished: boolean
  publishedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    author: { type: String, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
)

export function getBlogModel(conn: Connection): Model<IBlog> {
  const models = conn.models as Record<string, Model<IBlog>>
  return models.Blog ?? conn.model<IBlog>("Blog", BlogSchema)
}

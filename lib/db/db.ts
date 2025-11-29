import mongoose, { Connection } from "mongoose"

type CacheEntry = {
  conn: Connection | null
  promise: Promise<Connection> | null
}

declare global {
  var __dbCacheMap: Record<string, CacheEntry> | undefined
}

const cacheMap: Record<string, CacheEntry> = global.__dbCacheMap || {}
global.__dbCacheMap = cacheMap

function envKeyFor(country?: string, location?: string) {
  if (!country) return "MONGODB_URI"
  const c = country.toUpperCase()
  if (c === "IN") {
    if (location) return `MONGODB_URI_${c}_${location.toUpperCase()}`
    return `MONGODB_URI_${c}`
  }
  return `MONGODB_URI_${c}`
}

export async function connectDB(country?: string, location?: string): Promise<Connection> {
  const key = country
    ? location
      ? `${country.toUpperCase()}_${location.toUpperCase()}`
      : country.toUpperCase()
    : "DEFAULT"

  const envKey = envKeyFor(country, location)
  const uri = process.env[envKey] || process.env.MONGODB_URI
  if (!uri) throw new Error(`Missing MongoDB URI for ${envKey}`)

  const existing = cacheMap[key]
  if (existing?.conn) return existing.conn

  if (!existing?.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
    }
    const promise = mongoose.createConnection(uri, opts).asPromise()
    cacheMap[key] = { conn: null, promise }
  }

  const conn = await cacheMap[key].promise!
  cacheMap[key].conn = conn
  return conn
}

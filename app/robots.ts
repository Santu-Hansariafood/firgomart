"use server"

import type { MetadataRoute } from "next"

const SITE_URL = "https://firgomart.com"

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin", "/admin/*", "/seller", "/seller/*", "/api", "/api/*"],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/api/feeds/google`
    ],
    host: SITE_URL,
  }
}

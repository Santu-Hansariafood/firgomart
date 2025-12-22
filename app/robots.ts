"use server"

import type { MetadataRoute } from "next"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://firgomart.com"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/admin", "/admin/*", "/seller", "/seller/*", "/api", "/api/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap`,
    host: siteUrl,
  }
}

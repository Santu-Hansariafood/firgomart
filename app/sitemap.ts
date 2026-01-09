import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firgomart.com'

  const routes = [
    '',
    '/blog',
    '/about',
    '/careers',
    '/contact',
    '/teams',
    '/trust-safety',
    '/faq',
    '/help',
    '/shipping',
    '/returns',
    '/privacy-policy',
    '/terms',
    '/site-map',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))
}

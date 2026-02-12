import { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db/db'
import { getProductModel } from '@/lib/models/Product'
import categoriesData from '@/data/categories.json'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://firgomart.com'

  const routes = [
    '',
    '/grocery',
    '/new-arrivals',
    '/seller',
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

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' ? 'daily' : 'monthly') as 'daily' | 'monthly',
    priority: route === '' ? 1 : 0.8,
  }))

  const categoryRoutes = categoriesData.categories.map((category) => ({
    url: `${baseUrl}/category/${category.key}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping dynamic sitemap generation: MONGODB_URI not found')
    } else {
      const conn = await connectDB()
      const Product = getProductModel(conn)
      const products = await Product.find(
        { status: { $nin: ['draft', 'inactive'] } },
        '_id updatedAt'
      ).lean()
      
      productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/product/${product._id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.warn('Sitemap generation failed (likely DB connection issue during build), returning static routes only.')
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}

import { Metadata, ResolvingMetadata } from 'next'
import { connectDB } from '@/lib/db/db'
import { getProductModel } from '@/lib/models/Product'
import ProductPageClient from './client'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProduct(id: string) {
  try {
    const conn = await connectDB()
    const ProductModel = getProductModel(conn)
    const product = await ProductModel.findById(id).lean()
    if (!product) return null
    
    return {
      ...product,
      _id: product._id.toString(),
      id: product._id.toString(),
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  const previousImages = (await parent).openGraph?.images || []
  const productImages = (product.images && product.images.length > 0)
    ? product.images
    : (product.image ? [product.image] : [])

  return {
    title: `${product.name} | FirgoMart`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at FirgoMart. Best prices and quality assurance.`,
    openGraph: {
      title: `${product.name} | FirgoMart`,
      description: product.description?.slice(0, 160),
      images: [...productImages, ...previousImages],
      url: `https://firgomart.com/product/${product.id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.slice(0, 160),
      images: productImages,
    },
    alternates: {
      canonical: `https://firgomart.com/product/${product.id}`,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product as any} />
}

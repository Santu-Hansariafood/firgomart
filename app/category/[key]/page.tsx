import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import categoriesData from '@/data/categories.json'
import CategoryClient from './CategoryClient'

type Props = {
  params: Promise<{ key: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params
  const category = categoriesData.categories.find((c) => c.key === key)

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const title = `${category.name} | FirgoMart`
  const description = `Shop for ${category.name} at FirgoMart. Best prices on ${category.subcategories?.slice(0, 5).join(', ')} and more.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: category.image ? [category.image] : [],
      url: `https://firgomart.com/category/${key}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `https://firgomart.com/category/${key}`,
    }
  }
}

export default async function CategoryPage({ params }: Props) {
  const { key } = await params
  const category = categoriesData.categories.find((c) => c.key === key)

  if (!category) {
    notFound()
  }

  return <CategoryClient categoryName={category.name} />
}

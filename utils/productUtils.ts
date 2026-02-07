import { DropdownItem } from '@/types/product'
import categoriesData from '@/data/categories.json'

type JsonCategory = { name: string; subcategories?: string[] }

export const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')

export const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
  const createNumSizes = (start: number, end: number) => {
    const arr: DropdownItem[] = []
    for (let i = start; i <= end; i++) arr.push({ id: String(i), label: String(i) })
    return arr
  }
  let newSizes: DropdownItem[] = []
  if (cat === "Women's Fashion" || cat === "Men's Fashion" || cat === "Women's Footwear") {
    newSizes = createNumSizes(4, 10)
    newSizes = [
      { id: 'XS', label: 'XS' },
      { id: 'S', label: 'S' },
      { id: 'M', label: 'M' },
      { id: 'L', label: 'L' },
      { id: 'XL', label: 'XL' },
      { id: 'XXL', label: 'XXL' },
      { id: '3XL', label: '3XL' },
      { id: 'Free Size', label: 'Free Size' },
      ...newSizes,
    ]
  } else if (cat === "Men's Footwear") {
    newSizes = createNumSizes(4, 11)
  } else if (cat === "Beauty & Skincare" || cat === "Home & Kitchen" || cat === "Mobiles & Accessories" || cat === "Jewellery & Accessories") {
    newSizes = []
  } else {
    newSizes = [
      { id: 'XS', label: 'XS' },
      { id: 'S', label: 'S' },
      { id: 'M', label: 'M' },
      { id: 'L', label: 'L' },
      { id: 'XL', label: 'XL' },
      { id: 'XXL', label: 'XXL' },
      { id: '3XL', label: '3XL' },
      { id: 'Free Size', label: 'Free Size' },
    ]
  }
  return newSizes
}

export const allSizes: DropdownItem[] = [
  { id: 'XS', label: 'XS' },
  { id: 'S', label: 'S' },
  { id: 'M', label: 'M' },
  { id: 'L', label: 'L' },
  { id: 'XL', label: 'XL' },
  { id: 'XXL', label: 'XXL' },
  { id: '3XL', label: '3XL' },
  { id: 'Free Size', label: 'Free Size' },
  ...Array.from({ length: 8 }, (_, i) => ({ id: String(4 + i), label: String(4 + i) })), // 4-11
]

export const subcategoryOptionsFor = (cat: string): DropdownItem[] => {
  const entry = ((categoriesData as { categories: JsonCategory[] }).categories || []).find((c) => c.name === cat)
  const subs: string[] = Array.isArray(entry?.subcategories) ? entry!.subcategories : []
  return subs.map((s) => ({ id: s, label: s }))
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN').format(price)
}

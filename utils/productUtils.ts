import { DropdownItem } from '@/types/product'
import categoriesData from '@/data/categories.json'

type JsonCategory = { name: string; subcategories?: string[] }

export const sanitizeImageUrl = (src: string) => (src || '').trim().replace(/[)]+$/g, '')

export const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
  const clothingSizes: DropdownItem[] = [
    { id: 'XS', label: 'XS' },
    { id: 'S', label: 'S' },
    { id: 'M', label: 'M' },
    { id: 'L', label: 'L' },
    { id: 'XL', label: 'XL' },
    { id: 'XXL', label: 'XXL' },
    { id: '3XL', label: '3XL' },
    { id: 'Free Size', label: 'Free Size' },
  ]

  const createNumSizes = (start: number, end: number) => {
    const arr: DropdownItem[] = []
    for (let i = start; i <= end; i++) arr.push({ id: String(i), label: String(i) })
    return arr
  }

  if (cat === "Women's Fashion" || cat === "Men's Fashion") {
    return clothingSizes
  }

  if (cat === "Women's Footwear" || cat === "Men's Footwear") {
    return createNumSizes(4, 10)
  }

  if (cat === "Home & Kitchen") {
    return [
      { id: 'Free Size', label: 'Free Size' },
      { id: 'cm', label: 'cm' },
      { id: 'liter', label: 'liter' },
      { id: 'kg', label: 'kg' },
    ]
  }

  if (
    cat === "Beauty & Skincare" ||
    cat === "Mobile & Electronics" ||
    cat === "Fashion Accessories" ||
    cat === "Fashion Jewellery"
  ) {
    return []
  }

  return clothingSizes
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

export type CountryConfig = {
  code: string
  name: string
  currencyCode: string
  currencySymbol: string
  currencyHtml: string
}

export const SUPPORTED_COUNTRIES: CountryConfig[] = [
  { code: 'IN', name: 'India', currencyCode: 'INR', currencySymbol: '₹', currencyHtml: '&#8377;' },
  { code: 'SA', name: 'Saudi Arabia', currencyCode: 'SAR', currencySymbol: 'SAR', currencyHtml: '&#65020;' },
  { code: 'US', name: 'United States', currencyCode: 'USD', currencySymbol: '$', currencyHtml: '&#36;' },
  { code: 'AE', name: 'United Arab Emirates', currencyCode: 'AED', currencySymbol: 'AED', currencyHtml: 'AED' },
  { code: 'QA', name: 'Qatar', currencyCode: 'QAR', currencySymbol: 'QAR', currencyHtml: 'QAR' },
  { code: 'KW', name: 'Kuwait', currencyCode: 'KWD', currencySymbol: 'KWD', currencyHtml: 'KWD' },
  { code: 'AE-DU', name: 'Dubai', currencyCode: 'AED', currencySymbol: 'AED', currencyHtml: 'AED' },
]

export const getCountryByCode = (code?: string) => {
  if (!code) return undefined
  return SUPPORTED_COUNTRIES.find(c => c.code === code)
}

export const getCurrencyForCountry = (code?: string) => {
  const country = getCountryByCode(code) || SUPPORTED_COUNTRIES[0]
  return {
    code: country.currencyCode,
    symbol: country.currencySymbol,
    html: country.currencyHtml,
  }
}

export const getMaxQuantity = (price: number): number => {
  if (price < 1000) return 3
  if (price < 2000) return 2
  return 1
}

export const getProductSlug = (name: string, id: string | number) => {
  const base = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = String(id)
  return base ? `${base}-${suffix}` : suffix
}

export const getProductPath = (name: string, id: string | number) => {
  return `/product/${getProductSlug(name, id)}`
}

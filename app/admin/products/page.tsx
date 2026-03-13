"use client"

import { useEffect, useMemo, useState, Suspense, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import categoriesData from "@/data/categories.json"
import colorsData from "@/data/colors.json"
import locationData  from "@/data/country.json"
import { Package, Edit, Trash, X, Plus, Crop } from "lucide-react"
import dynamic from "next/dynamic"
import FallbackImage from "@/components/common/Image/FallbackImage"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import toast from "react-hot-toast"
import { SUPPORTED_COUNTRIES, getCurrencyForCountry } from "@/utils/productUtils"
import ProductModal, { DropdownItem as DDItem } from "@/components/ui/AdminProducts/ProductModal"
import { useAdminProductsLoader } from "@/hooks/admin-products/useAdminProductsLoader"
import { useGstStateAutoFill } from "@/hooks/admin-products/useGstStateAutoFill"
import { useProductIdOptions } from "@/hooks/admin-products/useProductIdOptions"

const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))
const ImageCropper = dynamic(() => import("@/components/common/ImageCropper/ImageCropper"))

type ProductItem = {
  id: string
  name: string
  category?: string
  subcategory?: string
  price: number
  currencyCode?: string
  originalPrice?: number
  stock?: number
  sellerState?: string
  sellerHasGST?: boolean
  createdByEmail?: string
  createdAt?: string
  brand?: string
  colors?: string[]
  sizes?: string[]
  about?: string
  additionalInfo?: string
  description?: string
  image?: string
  images?: string[]
  height?: number
  width?: number
  length?: number
  weight?: number
  dimensionUnit?: string
  lengthUnit?: string
  weightUnit?: string
  hsnCode?: string
  gstNumber?: string
  productId?: string
  availableCountry?: string
  deliveryTimeDays?: number
}

const gstStateMap: Record<string, string> = {
  "01": "Jammu and Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur",
  "15": "Mizoram", "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman and Diu", "26": "Dadra and Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
  "29": "Karnataka", "30": "Goa", "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
  "34": "Puducherry", "35": "Andaman and Nicobar Islands", "36": "Telangana", "37": "Andhra Pradesh",
  "38": "Ladakh", "97": "Other Territory", "99": "Centre Jurisdiction"
}

type DropdownItem = { id: string | number; label: string }

function noopFn(_: unknown) {}

export default function Page() {
  const { data: session } = useSession()
  const { user: authUser } = useAuth()
  const allowed = useMemo(() => {
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const sessionAdmin = !!(session?.user?.email && emails.includes(session.user.email.toLowerCase()))
    const authContextAdmin = !!(authUser?.email && emails.includes(authUser.email.toLowerCase())) || ((authUser as { role?: string } | null)?.role === "admin")
    return sessionAdmin || authContextAdmin
  }, [session, authUser])

  const [products, setProducts] = useState<ProductItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 100

  type IndiaState = { state: string }
  type Country = { country: string; states?: IndiaState[] }
  const india = (locationData.countries as Country[]).find((c) => c.country === "India")
  const stateOptions: DropdownItem[] = (india?.states || []).map((s) => ({ id: s.state, label: s.state }))
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null)
  const categoryOptions: DropdownItem[] = (categoriesData as any).categories.map((c: { name: string }) => ({ id: c.name, label: c.name }))
  const subcategoryOptionsFor = (cat: string): DropdownItem[] => {
    const entry = ((categoriesData as any).categories || []).find((c: { name: string }) => c.name === cat)
    const subs: string[] = Array.isArray(entry?.subcategories) ? entry!.subcategories : []
    return subs.map((s) => ({ id: s, label: s }))
  }
  const gstOptions: DropdownItem[] = [
    { id: "", label: "GST: Any" },
    { id: "true", label: "GST: Yes" },
    { id: "false", label: "GST: No" },
  ]
  const [selectedGST, setSelectedGST] = useState<DropdownItem>(gstOptions[0])
  const onStateChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setSelectedState(v) }
  const onGSTChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setSelectedGST(v) }

  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [category, setCategory] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComboPack, setIsComboPack] = useState(false)
  const [comboItems, setComboItems] = useState<{ productId: string; quantity: string }[]>([])
  
  const [formName, setFormName] = useState("")
  const [formProductId, setFormProductId] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSubcategory, setFormSubcategory] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formAvailableCountry, setFormAvailableCountry] = useState("IN")
  const [selectedCountryItems, setSelectedCountryItems] = useState<DropdownItem[]>([])
  const [countryPriceRows, setCountryPriceRows] = useState<{ country: string; price: string; originalPrice: string; currencyCode: string }[]>([])
  const [formDeliveryTimeDays, setFormDeliveryTimeDays] = useState("")
  const [formOriginalPrice, setFormOriginalPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formUnitsPerPack, setFormUnitsPerPack] = useState("1")
  const [formSellerState, setFormSellerState] = useState("")
  const [formGST, setFormGST] = useState(false)
  const [formBrand, setFormBrand] = useState("")
  const [formColors, setFormColors] = useState("")
  const [formSizes, setFormSizes] = useState("")
  const [formAbout, setFormAbout] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAddInfo, setFormAddInfo] = useState("")
  const [formHSNCode, setFormHSNCode] = useState("")
  const [formGSTNumber, setFormGSTNumber] = useState("")
  const [images, setImages] = useState<string[]>([])

  const [formHeight, setFormHeight] = useState("")
  const [formWidth, setFormWidth] = useState("")
  const [formLength, setFormLength] = useState("")
  const [formWeight, setFormWeight] = useState("")
  const [formDimensionUnit, setFormDimensionUnit] = useState("cm")
  const [formLengthUnit, setFormLengthUnit] = useState("cm")
  const [formWeightUnit, setFormWeightUnit] = useState("kg")

  const colorOptions: DropdownItem[] = (colorsData as any).colors
  const countryOptions: DropdownItem[] = SUPPORTED_COUNTRIES.map((c) => ({ id: c.code, label: c.name }))
  const onFormCountryChange = (v: DropdownItem | DropdownItem[]) => {
    if (Array.isArray(v)) {
      setSelectedCountryItems(v as DropdownItem[])
      const codes = new Set((v as DropdownItem[]).map(i => String(i.id)))
      const next: { country: string; price: string; originalPrice: string; currencyCode: string }[] = []
      for (const item of v as DropdownItem[]) {
        const code = String(item.id)
        const found = countryPriceRows.find(r => r.country === code)
        if (found) next.push(found)
        else {
          const cur = getCurrencyForCountry(code)
          next.push({ country: code, price: "", originalPrice: "", currencyCode: cur.code })
        }
      }
      setCountryPriceRows(next)
    } else {
      setFormAvailableCountry(String((v as DropdownItem).id))
    }
  }
  const currentCurrency = getCurrencyForCountry(formAvailableCountry)
  
  const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
      const clothingSizes: DropdownItem[] = [
        { id: "XS", label: "XS" },
        { id: "S", label: "S" },
        { id: "M", label: "M" },
        { id: "L", label: "L" },
        { id: "XL", label: "XL" },
        { id: "XXL", label: "XXL" },
        { id: "3XL", label: "3XL" },
        { id: "Free Size", label: "Free Size" },
      ]

      const createNumSizes = (start: number, end: number) => {
        const arr: DropdownItem[] = []
        for (let i = start; i <= end; i++) {
          arr.push({ id: String(i), label: String(i) })
        }
        return arr
      }

      let newSizes: DropdownItem[] = []

      const catEntry = ((categoriesData as any).categories || []).find((c: any) => c.name === cat)
      if (catEntry && Array.isArray(catEntry.ageGroup) && catEntry.ageGroup.length > 0) {
        newSizes = catEntry.ageGroup.map((a: string) => ({ id: a, label: a }))
      } else if (cat === "Women's Fashion" || cat === "Men's Fashion") {
        newSizes = clothingSizes
      } else if (cat === "Women's Footwear" || cat === "Men's Footwear") {
        newSizes = createNumSizes(4, 10)
      } else if (cat === "Home & Kitchen") {
        newSizes = [
          { id: "Free Size", label: "Free Size" },
          { id: "cm", label: "cm" },
          { id: "liter", label: "liter" },
          { id: "kg", label: "kg" },
        ]
      } else if (
        cat === "Beauty & Skincare" ||
        cat === "Mobile & Electronics" ||
        cat === "Fashion Accessories" ||
        cat === "Fashion Jewellery"
      ) {
        newSizes = []
      } else {
        newSizes = clothingSizes
      }

      if (newSizes.length > 0) {
        newSizes.push({ id: "others", label: "Others" })
      }
      return newSizes
  }

  const [sizeOptions, setSizeOptions] = useState<DropdownItem[]>([])
  
  useEffect(() => {
    setSizeOptions(getSizeOptionsForCategory(formCategory))
  }, [formCategory])
  const [selectedColorItems, setSelectedColorItems] = useState<DropdownItem[]>([])
  const [selectedSizeItems, setSelectedSizeItems] = useState<DropdownItem[]>([])
  const [otherColorInput, setOtherColorInput] = useState("")
  const [otherSizeInput, setOtherSizeInput] = useState("")
  const normalize = (s: string) => s.trim().toLowerCase()
  const initSelectionsFromForm = (formStr: string, options: DropdownItem[]) => {
    const values = formStr.split(",").map((s) => s.trim()).filter(Boolean)
    const sel: DropdownItem[] = []
    const others: string[] = []
    const optMap = new Map(options.map((o) => [normalize(String(o.label)), o]))
    values.forEach((v) => {
      const key = normalize(v)
      const match = optMap.get(key)
      if (match && match.id !== "others") sel.push(match)
      else others.push(v)
    })
    if (others.length > 0) sel.push({ id: "others", label: "Others" })
    return { selected: sel, othersText: others.join(", ") }
  }
  const applyColorsToForm = (selected: DropdownItem[], othersText: string) => {
    const base = selected.filter((i) => i.id !== "others").map((i) => String(i.label))
    const extras = othersText.split(",").map((s) => s.trim()).filter(Boolean)
    setFormColors([...base, ...extras].join(", "))
  }
  const applySizesToForm = (selected: DropdownItem[], othersText: string) => {
    const base = selected.filter((i) => i.id !== "others").map((i) => String(i.label))
    const extras = othersText.split(",").map((s) => s.trim()).filter(Boolean)
    setFormSizes([...base, ...extras].join(", "))
  }

  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)

  const dimensionUnits = [
    { id: "cm", label: "cm" },
    { id: "inch", label: "inch" },
    { id: "mm", label: "mm" },
    { id: "m", label: "m" }
  ]
  const weightUnits = [
    { id: "kg", label: "kg" },
    { id: "g", label: "g" },
    { id: "mg", label: "mg" },
    { id: "lb", label: "lb" }
  ]

  const onFormCategoryChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) {
      setFormCategory(v.label)
      setFormSubcategory("")
    }
  }
  const onFormSellerStateChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setFormSellerState(v.label) }
  const { loadProducts } = useAdminProductsLoader({
    session,
    authUser,
    allowed,
    page,
    pageSize,
    category,
    selectedState,
    selectedGST,
    search,
    sortKey,
    sortOrder,
    setProducts,
    setTotal,
    setLoading
  })

  useGstStateAutoFill({
    formGST,
    formGSTNumber,
    setFormSellerState
  })

  const { productIdOptions } = useProductIdOptions({ session, authUser, products, isModalOpen })

  const openModal = (product?: ProductItem) => {
    if (product) {
      setEditingId(product.id)
      setFormName(product.name)
      setFormProductId(product.productId || "")
      setFormCategory(product.category || "")
      setFormSubcategory((product as any).subcategory || "")
      setFormPrice(String(product.price))
      setFormAvailableCountry(product.availableCountry || "IN")
      const availList: string[] = Array.isArray((product as any).availableCountries) ? (product as any).availableCountries : []
      const initialCountries: string[] = (availList.length > 0 ? availList : [product.availableCountry || "IN"]).filter(Boolean) as string[]
      const optMap = new Map(countryOptions.map(o => [String(o.id), o]))
      setSelectedCountryItems(initialCountries.map((code: string) => {
        const c = String(code)
        const match = optMap.get(c)
        return match || { id: c, label: c }
      }))
      const existingRows: { country: string; price: string; originalPrice: string; currencyCode: string }[] = []
      const cps: Array<{ country: string; price: number; originalPrice?: number; currencyCode?: string }> = Array.isArray((product as any).countryPrices) ? (product as any).countryPrices : []
      for (const c of initialCountries) {
        const row = cps.find(p => String(p.country).toUpperCase() === String(c).toUpperCase())
        const cur = getCurrencyForCountry(c)
        existingRows.push({
          country: c,
          price: row && typeof row.price === 'number' ? String(row.price) : "",
          originalPrice: row && typeof row.originalPrice === 'number' ? String(row.originalPrice) : "",
          currencyCode: row?.currencyCode || cur.code
        })
      }
      setCountryPriceRows(existingRows)
      setFormDeliveryTimeDays(product.deliveryTimeDays ? String(product.deliveryTimeDays) : "")
      setFormOriginalPrice(String(product.originalPrice || ""))
      setFormStock(String(product.stock || 0))
      setFormUnitsPerPack(String((product as any).unitsPerPack || 1))
      setFormSellerState(product.sellerState || "")
      setFormGST(!!product.sellerHasGST)
      setFormBrand(product.brand || "")
      setFormColors((product.colors || []).join(", "))
      setFormSizes((product.sizes || []).join(", "))
      const cInit = initSelectionsFromForm((product.colors || []).join(", "), colorOptions)
      
      const catSizes = getSizeOptionsForCategory(product.category || "")
      setSizeOptions(catSizes)
      const sInit = initSelectionsFromForm((product.sizes || []).join(", "), catSizes)
      
      setSelectedColorItems(cInit.selected)
      setOtherColorInput(cInit.othersText)
      setSelectedSizeItems(sInit.selected)
      setOtherSizeInput(sInit.othersText)
      setFormAbout(product.about || "")
      setFormDesc(product.description || "")
      setFormAddInfo(product.additionalInfo || "")
      setFormHSNCode(product.hsnCode || "")
      setFormGSTNumber(product.gstNumber || "")
      setImages(product.images && product.images.length ? product.images : (product.image ? [product.image] : []))
      const comboFlag = (product as any).isComboPack === true
      setIsComboPack(comboFlag)
      const comboRaw = Array.isArray((product as any).comboItems) ? (product as any).comboItems : []
      setComboItems(
        comboRaw.length > 0
          ? comboRaw.map((it: any) => ({
              productId: String(it?.productId || ""),
              quantity: String(it?.quantity ?? "1"),
            }))
          : [{ productId: "", quantity: "1" }]
      )
      
      setFormHeight(String(product.height || ""))
      setFormWidth(String(product.width || ""))
      setFormLength(String(product.length || ""))
      setFormWeight(String(product.weight || ""))
      setFormDimensionUnit(product.dimensionUnit || "cm")
      setFormLengthUnit(product.lengthUnit || "cm")
      setFormWeightUnit(product.weightUnit || "kg")
    } else {
      setEditingId(null)
      setFormName("")
      setFormCategory("")
      setFormSubcategory("")
      setFormPrice("")
      setFormAvailableCountry("IN")
      setSelectedCountryItems([])
      setCountryPriceRows([])
      setFormDeliveryTimeDays("")
      setFormOriginalPrice("")
      setFormStock("")
      setFormUnitsPerPack("1")
      setFormSellerState("")
      setFormGST(!!process.env.NEXT_PUBLIC_ADMIN_GST_NUMBER)
      setFormBrand("")
      setFormColors("")
      setFormSizes("")
      setSelectedColorItems([])
      setOtherColorInput("")
      setSelectedSizeItems([])
      setOtherSizeInput("")
      setFormAbout("")
      setFormDesc("")
      setFormAddInfo("")
      setFormHSNCode("")
      setFormGSTNumber(process.env.NEXT_PUBLIC_ADMIN_GST_NUMBER || "")
      setImages([])
      setIsComboPack(false)
      setComboItems([{ productId: "", quantity: "1" }])
      
      setFormHeight("")
      setFormWidth("")
      setFormLength("")
      setFormWeight("")
      setFormDimensionUnit("cm")
      setFormLengthUnit("cm")
      setFormWeightUnit("kg")
    }
    setCroppingImageIndex(null)
    setIsModalOpen(true)
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    if (images.length + files.length > 6) {
        toast.error("Maximum 6 images allowed")
        return
    }
    const arr: string[] = []
    for (const file of Array.from(files)) {
      const data = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(file)
      })
      arr.push(data)
    }
    setImages(prev => [...prev, ...arr])
  }

  const removeImage = (index: number) => {
    setImages(prev => {
        const next = [...prev]
        if (index < next.length) next[index] = ""
        return next
    })
  }

  const startCrop = (index: number) => {
    setCroppingImageIndex(index)
  }

  const onCropComplete = (croppedImage: string) => {
    if (croppingImageIndex !== null) {
      setImages(prev => {
        const next = [...prev]
        next[croppingImageIndex] = croppedImage
        return next
      })
      setCroppingImageIndex(null)
    }
  }

  const handleImageSlotChange = async (index: number, files: FileList | null) => {
    if (!files || !files[0]) return
    const file = files[0]
    const data = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.readAsDataURL(file)
    })
    setImages(prev => {
        const next = [...prev]
        while (next.length <= index) next.push("")
        next[index] = data
        return next
    })
  }

  const handleSave = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const resolvedImages = await Promise.all(images.map(async (img) => {
        if (!img) return ""
        if (img.startsWith("data:")) {
            try {
                 const res = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: [img] }) })
                 if (res.ok) {
                    const data = await res.json()
                    return data.urls[0] || ""
                 }
            } catch {}
            return ""
        }
        return img
    }))
    
    const finalImages = resolvedImages.filter(Boolean)
    const adminEmail = (session?.user?.email || authUser?.email || "").trim()

    const price = Number(formPrice)
    const originalPrice = formOriginalPrice ? Number(formOriginalPrice) : undefined
    const discount = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100) 
        : 0

    const comboPayload = comboItems
      .map(item => ({
        productId: item.productId.trim(),
        quantity: item.quantity ? Math.max(1, Number(item.quantity)) : 1,
      }))
      .filter(item => item.productId)

    if (isComboPack && comboPayload.length === 0) {
      toast.error("Please select at least one Product ID for the combo")
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: formName.trim(),
      productId: formProductId.trim(),
      category: formCategory.trim(),
      subcategory: formSubcategory.trim(),
      price,
      availableCountry: formAvailableCountry,
      availableCountries: selectedCountryItems.map(i => String(i.id)),
      countryPrices: countryPriceRows
        .map(r => {
          const p = Number(r.price || 0)
          const op = r.originalPrice ? Number(r.originalPrice) : undefined
          const d = op && op > p ? Math.round(((op - p) / op) * 100) : 0
          return { 
            country: r.country, 
            price: p, 
            originalPrice: op, 
            discount: d,
            currencyCode: r.currencyCode 
          }
        })
        .filter(p => Number.isFinite(p.price) && p.price > 0),
      currencyCode: currentCurrency.code,
      originalPrice,
      discount,
      stock: Number(formStock || 0),
      unitsPerPack: Number(formUnitsPerPack || 1),
      sellerState: formSellerState.trim(),
      sellerHasGST: formGST,
      images: finalImages,
      image: finalImages[0] || "/file.svg",
      brand: formBrand.trim(),
      colors: formColors.split(",").map(s => s.trim()).filter(Boolean),
      sizes: formSizes.split(",").map(s => s.trim()).filter(Boolean),
      about: formAbout.trim(),
      description: formDesc.trim(),
      additionalInfo: formAddInfo.trim(),
      height: formHeight ? Number(formHeight) : undefined,
      width: formWidth ? Number(formWidth) : undefined,
      length: formLength ? Number(formLength) : undefined,
      weight: formWeight ? Number(formWeight) : undefined,
      dimensionUnit: formDimensionUnit,
      lengthUnit: formLengthUnit,
      weightUnit: formWeightUnit,
      hsnCode: formHSNCode.trim(),
      gstNumber: formGSTNumber.trim(),
      deliveryTimeDays: formDeliveryTimeDays ? Number(formDeliveryTimeDays) : undefined,
      isComboPack,
      comboItems: comboPayload,
    }

    try {
      const url = editingId ? `/api/admin/products/${editingId}` : `/api/admin/products`
      const method = editingId ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        if (!editingId) setPage(1)
        loadProducts()
        toast.success(editingId ? "Product updated successfully" : "Product created successfully")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save product")
      }
    } catch {
      toast.error("Error saving product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          ...(adminEmail ? { "x-admin-email": adminEmail } : {}),
        },
      })
      if (res.ok) {
        loadProducts()
        toast.success("Product deleted successfully")
      } else {
        toast.error("Failed to delete product")
      }
    } catch {
      toast.error("Error deleting product")
    }
  }

  return (
    <Suspense fallback={<BeautifulLoader/>}>
      {!allowed ? (
        <AdminLogin />
      ) : (
        <div className="p-6 space-y-8">
          <BackButton className="mb-2" />
          <div className="bg-gradient-to-r from-brand-purple to-brand-red p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Product Management</h1>
                <p className="text-indigo-100 text-sm">Create, filter and manage catalog</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-semibold text-white">{total} Items</span>
               <button onClick={() => openModal()} className="bg-white text-brand-purple px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-brand-purple/10">
                 <Plus className="w-4 h-4" /> Add Product
               </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-sm mb-1 font-medium text-gray-600">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              {String(selectedGST.id) !== "true" && (
                <div>
                  <CommonDropdown
                    label="State"
                    options={stateOptions}
                    selected={selectedState}
                    onChange={onStateChange}
                    placeholder="Seller state"
                  />
                </div>
              )}
              <div>
                <CommonDropdown
                  label="GST"
                  options={gstOptions}
                  selected={selectedGST}
                  onChange={onGSTChange}
                  placeholder="GST"
                />
              </div>
              <div className="md:col-span-2">
                <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="px-4 py-6 text-gray-700">Loading…</div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-4">
                <CommonTable
                  columns={[
                    { key: "image", label: "Image", render: (r) => (
                      <FallbackImage src={(r as { image?: string }).image} alt={r.name} width={48} height={48} className="object-cover rounded border" />
                    ) },
                    { key: "productId", label: "Product ID", sortable: true },
                    { key: "name", label: "Name", sortable: true },
                    { key: "category", label: "Category", sortable: true },
                    { key: "price", label: "Price", sortable: true, render: (r) => {
                      const country = typeof (r as any).availableCountry === "string" ? (r as any).availableCountry : "IN"
                      const c = getCurrencyForCountry(country)
                      return (
                        <div className="flex flex-col">
                          <span className="font-medium">{c.symbol}{r.price}</span>
                          {r.originalPrice && r.originalPrice > r.price && (
                            <span className="text-xs text-gray-400 line-through">MRP: {c.symbol}{r.originalPrice}</span>
                          )}
                        </div>
                      )
                    } },
                    { key: "stock", label: "Stock", sortable: true },
                    { key: "brand", label: "Brand" },
                    { key: "sellerState", label: "State", sortable: true },
                    { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "" },
                    { key: "actions", label: "Actions", render: (r) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => openModal(r as ProductItem)} className="p-1 hover:bg-gray-100 rounded text-brand-purple">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete((r as ProductItem).id)} className="p-1 hover:bg-red-50 rounded text-red-600">
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                  ]}
                  data={products}
                  sortKey={sortKey || undefined}
                  sortOrder={sortOrder}
                  onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
                  rowKey={(r) => r.id}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total: {total}</div>
              <CommonPagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={total}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>

          {isModalOpen && (
            <ProductModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              editingId={editingId}
              currentCurrency={currentCurrency}
              countryOptions={countryOptions}
              stateOptions={stateOptions}
              categoryOptions={categoryOptions}
              subcategoryOptionsFor={subcategoryOptionsFor}
              dimensionUnits={dimensionUnits}
              weightUnits={weightUnits}
              colorOptions={colorOptions}
              sizeOptions={sizeOptions}
              formName={formName}
              setFormName={setFormName}
              formProductId={formProductId}
              setFormProductId={setFormProductId}
              formOriginalPrice={formOriginalPrice}
              setFormOriginalPrice={setFormOriginalPrice}
              formPrice={formPrice}
              setFormPrice={setFormPrice}
              formStock={formStock}
              setFormStock={setFormStock}
              formUnitsPerPack={formUnitsPerPack}
              setFormUnitsPerPack={setFormUnitsPerPack}
              formAvailableCountry={formAvailableCountry}
              onFormCountryChange={onFormCountryChange}
              selectedCountryItems={selectedCountryItems}
              setSelectedCountryItems={setSelectedCountryItems}
              countryPriceRows={countryPriceRows}
              setCountryPriceRows={setCountryPriceRows}
              formDeliveryTimeDays={formDeliveryTimeDays}
              setFormDeliveryTimeDays={setFormDeliveryTimeDays}
              formCategory={formCategory}
              onFormCategoryChange={onFormCategoryChange}
              formSubcategory={formSubcategory}
              setFormSubcategory={setFormSubcategory}
              formBrand={formBrand}
              setFormBrand={setFormBrand}
              formLength={formLength}
              setFormLength={setFormLength}
              formLengthUnit={formLengthUnit}
              setFormLengthUnit={setFormLengthUnit}
              formHeight={formHeight}
              setFormHeight={setFormHeight}
              formDimensionUnit={formDimensionUnit}
              setFormDimensionUnit={setFormDimensionUnit}
              formWidth={formWidth}
              setFormWidth={setFormWidth}
              formWeight={formWeight}
              setFormWeight={setFormWeight}
              formWeightUnit={formWeightUnit}
              setFormWeightUnit={setFormWeightUnit}
              selectedColorItems={selectedColorItems}
              setSelectedColorItems={setSelectedColorItems}
              selectedSizeItems={selectedSizeItems}
              setSelectedSizeItems={setSelectedSizeItems}
              otherColorInput={otherColorInput}
              setOtherColorInput={setOtherColorInput}
              otherSizeInput={otherSizeInput}
              setOtherSizeInput={setOtherSizeInput}
              applyColorsToForm={applyColorsToForm}
              applySizesToForm={applySizesToForm}
              formAbout={formAbout}
              setFormAbout={setFormAbout}
              formDesc={formDesc}
              setFormDesc={setFormDesc}
              formAddInfo={formAddInfo}
              setFormAddInfo={setFormAddInfo}
              formHSNCode={formHSNCode}
              setFormHSNCode={setFormHSNCode}
              formGST={formGST}
              setFormGST={setFormGST}
              formGSTNumber={formGSTNumber}
              setFormGSTNumber={setFormGSTNumber}
              formSellerState={formSellerState}
              onFormSellerStateChange={onFormSellerStateChange}
              images={images}
              removeImage={removeImage}
              startCrop={startCrop}
              handleImageSlotChange={handleImageSlotChange}
              isComboPack={isComboPack}
              setIsComboPack={setIsComboPack}
              comboItems={comboItems}
              setComboItems={setComboItems}
              productIdOptions={productIdOptions as DDItem[]}
              isSubmitting={isSubmitting}
              handleSave={handleSave}
            />
          )}
          {croppingImageIndex !== null && images[croppingImageIndex] && (
            <ImageCropper 
                imageSrc={images[croppingImageIndex]} 
                onCancel={() => setCroppingImageIndex(null)}
                onCropComplete={onCropComplete}
            />
          )}
        </div>
      )}
    </Suspense>
  )
}

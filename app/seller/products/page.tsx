"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import categoriesData from "@/data/categories.json"
import colorsData from "@/data/colors.json"
import locationData  from "@/data/country.json"
import { Package, Edit, Trash, X, Plus, Crop } from "lucide-react"
import dynamic from "next/dynamic"
import FallbackImage from "@/components/common/Image/FallbackImage"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

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

export default function Page() {
  const { user } = useAuth()
  const sellerEmail = user?.email || ""
  const allowed = !!sellerEmail

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
  
  // Form States
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSubcategory, setFormSubcategory] = useState("")
  const [formPrice, setFormPrice] = useState("")
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

  // Dimensions & Weight
  const [formHeight, setFormHeight] = useState("")
  const [formWidth, setFormWidth] = useState("")
  const [formLength, setFormLength] = useState("")
  const [formWeight, setFormWeight] = useState("")
  const [formDimensionUnit, setFormDimensionUnit] = useState("cm")
  const [formLengthUnit, setFormLengthUnit] = useState("cm")
  const [formWeightUnit, setFormWeightUnit] = useState("kg")

  const colorOptions: DropdownItem[] = (colorsData as any).colors
  
  const getSizeOptionsForCategory = (cat: string): DropdownItem[] => {
      const createNumSizes = (start: number, end: number) => {
        const arr: DropdownItem[] = [];
        for (let i = start; i <= end; i++) {
          arr.push({ id: String(i), label: String(i) });
        }
        return arr;
      };

      let newSizes: DropdownItem[] = [];
      if (cat === "Women's Fashion" || cat === "Men's Fashion" || cat === "Women's Footwear") {
        newSizes = createNumSizes(4, 10);
      } else if (cat === "Men's Footwear") {
        newSizes = createNumSizes(4, 11);
      } else if (cat === "Beauty & Skincare" || cat === "Home & Kitchen" || cat === "Mobiles & Accessories" || cat === "Jewellery & Accessories") {
        newSizes = [];
      } else {
         newSizes = [
            { id: "XS", label: "XS" },
            { id: "S", label: "S" },
            { id: "M", label: "M" },
            { id: "L", label: "L" },
            { id: "XL", label: "XL" },
            { id: "XXL", label: "XXL" },
            { id: "3XL", label: "3XL" },
            { id: "Free Size", label: "Free Size" },
         ];
      }
      if (newSizes.length > 0) {
         newSizes.push({ id: "others", label: "Others" });
      }
      return newSizes;
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

  // Cropping
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

  const loadProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (category) params.set("category", category)
      if (selectedState?.id && String(selectedGST.id) !== "true") params.set("state", String(selectedState.id))
      if (selectedGST?.id !== undefined && selectedGST.id !== "") params.set("hasGST", String(selectedGST.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      if (sellerEmail) params.set("sellerEmail", sellerEmail)

      const res = await fetch(`/api/seller/products?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setProducts(Array.isArray(data.products) ? data.products : [])
        setTotal(Number(data.total || 0))
      } else {
        setProducts([])
        setTotal(0)
      }
    } catch {
      setProducts([])
      setTotal(0)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!allowed) return
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, page, selectedState, selectedGST, search, sortKey, sortOrder, category, sellerEmail])

  useEffect(() => {
    if (formGST) setFormSellerState("")
  }, [formGST])

  useEffect(() => {
    if (formGSTNumber.length >= 2) {
      const code = formGSTNumber.substring(0, 2)
      const state = gstStateMap[code]
      if (state) setFormSellerState(state)
    }
  }, [formGSTNumber])

  const openModal = (product?: ProductItem) => {
    if (product) {
      setEditingId(product.id)
      setFormName(product.name)
      setFormCategory(product.category || "")
      setFormSubcategory((product as any).subcategory || "")
      setFormPrice(String(product.price))
      setFormOriginalPrice(String(product.originalPrice || ""))
      setFormStock(String(product.stock || 0))
      setFormUnitsPerPack(String((product as any).unitsPerPack || 1))
      setFormSellerState(product.sellerState || "")
      setFormGST(!!product.sellerHasGST)
      setFormBrand(product.brand || "")
      setFormColors((product.colors || []).join(", "))
      setFormSizes((product.sizes || []).join(", "))
      const cInit = initSelectionsFromForm((product.colors || []).join(", "), colorOptions)
      const sInit = initSelectionsFromForm((product.sizes || []).join(", "), sizeOptions)
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
      setFormOriginalPrice("")
      setFormStock("")
      setFormUnitsPerPack("1")
      setFormSellerState("")
      const autoGst = user?.sellerDetails?.gstNumber || user?.sellerDetails?.panNumber || ""
      setFormGST(!!autoGst)
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
      setFormGSTNumber(autoGst)
      setImages([])
      
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
        alert("Maximum 6 images allowed")
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

    const price = Number(formPrice)
    const originalPrice = formOriginalPrice ? Number(formOriginalPrice) : undefined
    const discount = originalPrice && originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100) 
        : 0

    const payload = {
      name: formName.trim(),
      category: formCategory.trim(),
      subcategory: formSubcategory.trim(),
      price,
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
      sellerEmail: sellerEmail, // Required for seller API
      id: editingId // Include ID for updates if API expects it in body
    }

    try {
      const url = editingId ? `/api/seller/products` : `/api/seller/products`
      const method = editingId ? "PATCH" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        if (!editingId) setPage(1)
        loadProducts()
      } else {
        const err = await res.json()
        alert(err.error || "Failed to save product")
      }
    } catch {
        alert("Error saving product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await fetch(`/api/seller/products?id=${encodeURIComponent(id)}&sellerEmail=${encodeURIComponent(sellerEmail)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        loadProducts()
      } else {
        alert("Failed to delete product")
      }
    } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader/>}>
      {!allowed ? (
         <div className="p-6 text-center text-gray-600">Please login as seller.</div>
      ) : (
        <div className="p-6 space-y-8">
          <BackButton className="mb-2" />
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">My Products</h1>
                <p className="text-indigo-100 text-sm">Create, filter and manage your catalog</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-2xl font-semibold text-white">{total} Items</span>
               <button onClick={() => openModal()} className="bg-white text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-50">
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
              <BeautifulLoader />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-4">
                <CommonTable
                  columns={[
                    { key: "image", label: "Image", render: (r) => (
                      <FallbackImage src={(r as { image?: string }).image || ""} alt={r.name} width={48} height={48} className="object-cover rounded border" />
                    ) },
                    { key: "name", label: "Name", sortable: true },
                    { key: "category", label: "Category", sortable: true },
                    { key: "price", label: "Price", sortable: true, render: (r) => `₹${r.price}` },
                    { key: "stock", label: "Stock", sortable: true },
                    { key: "brand", label: "Brand" },
                    { key: "sellerState", label: "State", sortable: true },
                    { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "" },
                    { key: "actions", label: "Actions", render: (r) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => openModal(r as ProductItem)} className="p-1 hover:bg-gray-100 rounded text-blue-600">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-xl font-bold">{editingId ? "Edit Product" : "Add Product"}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Basic Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                            <input type="number" value={formOriginalPrice} onChange={e => setFormOriginalPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Original" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                            <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Sale" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" min={1} value={formUnitsPerPack} onChange={e => setFormUnitsPerPack(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Units per product (e.g., 1 or 2)" />
                            <p className="text-xs text-gray-500 mt-1">Enter how many units are in this product listing.</p>
                          </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <CommonDropdown
                                options={categoryOptions}
                                selected={formCategory ? { id: formCategory, label: formCategory } : null}
                                onChange={onFormCategoryChange}
                                placeholder="Select Category"
                            />
                        </div>
                        {formCategory && subcategoryOptionsFor(formCategory).length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product type</label>
                            <CommonDropdown
                              options={subcategoryOptionsFor(formCategory)}
                              selected={formSubcategory ? { id: formSubcategory, label: formSubcategory } : null}
                              onChange={(v) => {
                                if (!Array.isArray(v)) {
                                  setFormSubcategory(v.label)
                                  const catEntry = (categoriesData as any).categories.find((c: any) => c.name === formCategory)
                                  if (catEntry && catEntry.hsnMap) {
                                    const hsn = catEntry.hsnMap[v.label]
                                    if (Array.isArray(hsn) && hsn.length > 0) setFormHSNCode(String(hsn[0]))
                                    else if (typeof hsn === "string") setFormHSNCode(hsn)
                                  }
                                }
                              }}
                              placeholder="Select Product type"
                            />
                          </div>
                        )}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                             <input value={formBrand} onChange={e => setFormBrand(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Nike, Apple" />
                        </div>
                        
                        {/* Dimensions & Weight */}
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                                <div className="flex gap-1">
                                    <input type="number" value={formLength} onChange={e => setFormLength(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Length" />
                                    <select value={formLengthUnit} onChange={e => setFormLengthUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                                        {dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                                <div className="flex gap-1">
                                    <input type="number" value={formHeight} onChange={e => setFormHeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Height" />
                                    <select value={formDimensionUnit} onChange={e => setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                                        {dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                                <div className="flex gap-1">
                                    <input type="number" value={formWidth} onChange={e => setFormWidth(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Width" />
                                    <select value={formDimensionUnit} onChange={e => setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                                        {dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                <div className="flex gap-1">
                                    <input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Weight" />
                                    <select value={formWeightUnit} onChange={e => setFormWeightUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                                        {weightUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                    </select>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Product Details</h3>
                        <div>
                          <CommonDropdown
                            label="Colors"
                            options={colorOptions}
                            selected={selectedColorItems}
                            onChange={(v) => {
                              if (Array.isArray(v)) {
                                const list = v as DropdownItem[]
                                setSelectedColorItems(list)
                                if (list.some((i) => i.id === "others")) {
                                  applyColorsToForm(list, otherColorInput)
                                } else {
                                  setOtherColorInput("")
                                  applyColorsToForm(list, "")
                                }
                              }
                            }}
                            multiple
                            placeholder="Select colors"
                          />
                          {selectedColorItems.some((i) => i.id === "others") && (
                            <div className="mt-2">
                              <input
                                value={otherColorInput}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setOtherColorInput(val)
                                  applyColorsToForm(selectedColorItems, val)
                                }}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter custom colors (comma separated)"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <CommonDropdown
                            label="Sizes"
                            options={sizeOptions}
                            selected={selectedSizeItems}
                            onChange={(v) => {
                              if (Array.isArray(v)) {
                                const list = v as DropdownItem[]
                                setSelectedSizeItems(list)
                                if (list.some((i) => i.id === "others")) {
                                  applySizesToForm(list, otherSizeInput)
                                } else {
                                  setOtherSizeInput("")
                                  applySizesToForm(list, "")
                                }
                              }
                            }}
                            multiple
                            placeholder="Select sizes"
                          />
                          {selectedSizeItems.some((i) => i.id === "others") && (
                            <div className="mt-2">
                              <input
                                value={otherSizeInput}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setOtherSizeInput(val)
                                  applySizesToForm(selectedSizeItems, val)
                                }}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Enter custom sizes (comma separated)"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">About Product (Short Summary)</label>
                             <textarea value={formAbout} onChange={e => setFormAbout(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                             <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={4} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                             <textarea value={formAddInfo} onChange={e => setFormAddInfo(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Technical specs, warranty info, etc." />
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-700">Seller & Tax</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                                <input value={formHSNCode} onChange={e => setFormHSNCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="HSN Code" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input id="gst_modal" type="checkbox" checked={formGST} onChange={(e) => setFormGST(e.target.checked)} />
                                <label htmlFor="gst_modal" className="text-sm font-medium text-gray-700">Seller has GST</label>
                            </div>
                            {formGST ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                    <input value={formGSTNumber} onChange={e => setFormGSTNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="GST Number" maxLength={15} />
                                    {formSellerState && <p className="text-xs text-green-600 mt-1">Detected State: {formSellerState}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller State</label>
                                    <CommonDropdown
                                        options={stateOptions}
                                        selected={formSellerState ? { id: formSellerState, label: formSellerState } : null}
                                        onChange={onFormSellerStateChange}
                                        placeholder="Select State"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                             <h3 className="font-semibold text-gray-700">Product Images (6 Slots)</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <div key={index} className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-600">Image {index + 1}</label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 h-32 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                            {images[index] ? (
                                                <div className="relative w-full h-full group">
                                                    <FallbackImage src={images[index]} alt={`Image ${index + 1}`} fill className="object-contain rounded" />
                                                    <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => startCrop(index)} className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm" title="Crop">
                                                        <Crop className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <span className="text-gray-400 text-xs">Upload</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => handleImageSlotChange(index, e.target.files)} 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={!!images[index]}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3 bg-white z-10 sticky bottom-0">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium" disabled={isSubmitting}>Cancel</button>
                  <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingId ? "Update Product" : "Create Product")}
                  </button>
                </div>
              </div>
            </div>
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

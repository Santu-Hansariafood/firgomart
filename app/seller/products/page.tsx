"use client"

import { useAuth } from "@/context/AuthContext"
import { useEffect, useState, Suspense } from "react"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"
import BackButton from "@/components/common/BackButton/BackButton"
import CommonTable from "@/components/common/Table/CommonTable"
import CommonPagination from "@/components/common/Pagination/CommonPagination"
import SearchBox from "@/components/common/SearchBox/SearchBox"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import categoriesData from "@/data/categories.json"
import FallbackImage from "@/components/common/Image/FallbackImage"
import locationData from "@/data/country.json"
import dynamic from "next/dynamic"
const ImageCropper = dynamic(() => import("@/components/common/ImageCropper/ImageCropper"))

type DropdownItem = { id: string | number; label: string }

type ProductRow = {
  _id: string
  name: string
  category?: string
  price: number
  discount?: number
  stock?: number
  status?: string
  image: string
  createdAt?: string
  sellerState?: string
  sellerHasGST?: boolean
}

export default function Page() {
  const { user } = useAuth()
  const email = user?.email || ""
  const allowed = !!email
  const [rows, setRows] = useState<ProductRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 100
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<DropdownItem | null>(null)
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null)
  const [selectedGST, setSelectedGST] = useState<DropdownItem | null>({ id: "", label: "GST: All" })

  const [formName, setFormName] = useState("")
  const [formOriginalPrice, setFormOriginalPrice] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSubcategory, setFormSubcategory] = useState("")
  const [formBrand, setFormBrand] = useState("")
  const [formColors, setFormColors] = useState("")
  const [formSizes, setFormSizes] = useState("")
  const [formAbout, setFormAbout] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAddInfo, setFormAddInfo] = useState("")
  const [formHSNCode, setFormHSNCode] = useState("")
  const [formGST, setFormGST] = useState(false)
  const [formGSTNumber, setFormGSTNumber] = useState("")
  const [formSellerState, setFormSellerState] = useState("")
  const [formLength, setFormLength] = useState("")
  const [formWidth, setFormWidth] = useState("")
  const [formHeight, setFormHeight] = useState("")
  const [formWeight, setFormWeight] = useState("")
  const [formDimensionUnit, setFormDimensionUnit] = useState("cm")
  const [formLengthUnit, setFormLengthUnit] = useState("cm")
  const [formWeightUnit, setFormWeightUnit] = useState("kg")
  const [images, setImages] = useState<string[]>(["", "", "", "", "", ""])
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const categoryOptions = (categoriesData.categories || []).map((c: { name: string }) => ({ id: c.name, label: c.name }))
  type IndiaState = { state: string }
  type Country = { country: string; states?: IndiaState[] }
  const india = (locationData.countries as Country[]).find((c) => c.country === "India")
  const stateOptions: DropdownItem[] = (india?.states || []).map((s) => ({ id: s.state, label: s.state }))
  const gstOptions: DropdownItem[] = [
    { id: "", label: "GST: All" },
    { id: "true", label: "GST: Yes" },
    { id: "false", label: "GST: No" },
  ]

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    const data = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      const first = Array.from(files)[0]
      if (first) r.readAsDataURL(first)
    })
    const idx = images.findIndex(x => !x)
    const next = [...images]
    next[idx >= 0 ? idx : 0] = data
    setImages(next)
  }
  const handleImageSlotChange = async (index: number, files: FileList | null) => {
    if (!files) return
    const data = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.readAsDataURL(Array.from(files)[0])
    })
    const next = [...images]
    next[index] = data
    setImages(next)
  }
  const removeImage = (index: number) => {
    const next = [...images]
    next[index] = ""
    setImages(next)
  }
  const startCrop = (index: number) => setCroppingImageIndex(index)
  const onCropComplete = (img: string) => {
    if (croppingImageIndex === null) return
    const next = [...images]
    next[croppingImageIndex] = img
    setImages(next)
    setCroppingImageIndex(null)
  }
  const dimensionUnits: DropdownItem[] = [{ id: "cm", label: "cm" }, { id: "in", label: "in" }]
  const weightUnits: DropdownItem[] = [{ id: "kg", label: "kg" }, { id: "g", label: "g" }]
  const subcategoryOptionsFor = (cat: string) => {
    const found = (categoriesData.categories || []).find((c: any) => String(c.name).toLowerCase() === String(cat).toLowerCase())
    return (found?.subcategories || []).map((s: any) => ({ id: s.name, label: s.name }))
  }
  const onFormCategoryChange = (v: DropdownItem | DropdownItem[]) => {
    if (!Array.isArray(v)) {
      setFormCategory(v.label)
      setFormSubcategory("")
    }
  }
  const onFormSellerStateChange = (v: DropdownItem | DropdownItem[]) => { if (!Array.isArray(v)) setFormSellerState(v.label) }

  const load = async () => {
    if (!email) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("sellerEmail", email)
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/seller/products?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        let list: ProductRow[] = data.products || []
        if (selectedCategoryItem?.label) list = list.filter(p => String(p.category || "").toLowerCase() === String(selectedCategoryItem.label || "").toLowerCase())
        if (selectedState?.id) list = list.filter(p => String(p.sellerState || "").toLowerCase() === String(selectedState.label || "").toLowerCase())
        if (selectedGST?.id === "true") list = list.filter(p => p.sellerHasGST === true)
        if (selectedGST?.id === "false") list = list.filter(p => p.sellerHasGST === false)
        setRows(list)
        setTotal(Number(data.total || 0))
      } else { setRows([]); setTotal(0) }
    } catch { setRows([]); setTotal(0) }
    setLoading(false)
  }

  useEffect(() => {
    if (!email) return
    let cancelled = false
    ;(async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("sellerEmail", email)
        params.set("page", String(page))
        params.set("limit", String(pageSize))
        if (search) params.set("search", search)
        const res = await fetch(`/api/seller/products?${params.toString()}`)
        const data = await res.json()
        if (cancelled) return
        if (res.ok) { setRows(data.products || []); setTotal(Number(data.total || 0)) } else { setRows([]); setTotal(0) }
      } catch { if (!cancelled) { setRows([]); setTotal(0) } }
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [email, page, search, sortKey, sortOrder, selectedCategoryItem, selectedState, selectedGST])

  const handleSave = async () => {
    if (!formName || !formPrice) return
    setIsSubmitting(true)
    try {
      const toUpload = images.filter(Boolean)
      let uploaded: string[] = []
      if (toUpload.length) {
        const up = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: toUpload }) })
        const upJson = await up.json()
        if (up.ok && Array.isArray(upJson.urls)) uploaded = upJson.urls
      }
      const payload = {
        name: formName,
        category: formCategory,
        subcategory: formSubcategory || undefined,
        price: Number(formPrice),
        originalPrice: formOriginalPrice ? Number(formOriginalPrice) : undefined,
        stock: formStock ? Number(formStock) : undefined,
        brand: formBrand || undefined,
        colors: formColors ? formColors.split(",").map(s => s.trim()).filter(Boolean) : [],
        sizes: formSizes ? formSizes.split(",").map(s => s.trim()).filter(Boolean) : [],
        about: formAbout || undefined,
        description: formDesc || undefined,
        additionalInfo: formAddInfo || undefined,
        hsnCode: formHSNCode || undefined,
        gstNumber: formGST ? (formGSTNumber || undefined) : undefined,
        height: formHeight ? Number(formHeight) : undefined,
        width: formWidth ? Number(formWidth) : undefined,
        length: formLength ? Number(formLength) : undefined,
        weight: formWeight ? Number(formWeight) : undefined,
        dimensionUnit: formDimensionUnit || undefined,
        lengthUnit: formLengthUnit || undefined,
        weightUnit: formWeightUnit || undefined,
        images: uploaded,
        image: uploaded[0] || "",
        sellerEmail: email,
      }
      const res = await fetch(`/api/seller/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) {
        setIsModalOpen(false)
        setPage(1)
        setFormName("")
        setFormOriginalPrice("")
        setFormPrice("")
        setFormStock("")
        setFormCategory("")
        setFormSubcategory("")
        setFormBrand("")
        setFormColors("")
        setFormSizes("")
        setFormAbout("")
        setFormDesc("")
        setFormAddInfo("")
        setFormHSNCode("")
        setFormGST(false)
        setFormGSTNumber("")
        setFormSellerState("")
        setFormLength("")
        setFormWidth("")
        setFormHeight("")
        setFormWeight("")
        setImages(["", "", "", "", "", ""])
        load()
      }
    } catch {}
    setIsSubmitting(false)
  }

  const updateField = async (id: string, changes: Partial<{ price: number; discount: number; stock: number; status: string }>) => {
    try {
      await fetch(`/api/seller/products`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, sellerEmail: email, ...changes }) })
      setRows(prev => prev.map(r => r._id === id ? { ...r, ...changes } : r))
    } catch {}
  }
  const deleteProduct = async (id: string) => {
    try { await fetch(`/api/seller/products?id=${encodeURIComponent(id)}&sellerEmail=${encodeURIComponent(email)}`, { method: "DELETE" }); load() } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader />}>
    {!allowed ? (
      <div className="p-6">Login as seller to manage products.</div>
    ) : (
    <div className="p-4 space-y-6">
      <BackButton className="mb-2" />
      <h1 className="text-2xl font-semibold">Product Management</h1>
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total: {total}</span>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded bg-blue-600 text-white">Add Product</button>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <SearchBox value={search} onChange={setSearch} placeholder="Search products" />
          </div>
          <div>
            <CommonDropdown
              options={categoryOptions}
              selected={selectedCategoryItem}
              onChange={(item) => setSelectedCategoryItem(item as DropdownItem)}
              placeholder="Filter by Category"
            />
          </div>
          <div>
            <CommonDropdown
              options={stateOptions}
              selected={selectedState}
              onChange={(item) => setSelectedState(item as DropdownItem)}
              placeholder="Filter by State"
            />
          </div>
          <div>
            <CommonDropdown
              options={gstOptions}
              selected={selectedGST}
              onChange={(item) => setSelectedGST(item as DropdownItem)}
              placeholder="GST"
            />
          </div>
        </div>
        {loading ? (
          <BeautifulLoader />
        ) : (
          <CommonTable
            columns={[ 
              { key: "image", label: "Image", render: (r) => (
                <FallbackImage src={r.image} alt={r.name} width={48} height={48} className="object-cover rounded border" />
              ) },
              { key: "name", label: "Name", sortable: true },
              { key: "category", label: "Category" },
              { key: "createdAt", label: "Created", sortable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString() : "" },
              { key: "price", label: "Price", sortable: true, render: (r) => (
                <input type="number" defaultValue={r.price} className="w-24 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { price: Number(e.currentTarget.value) })} />
              ) },
              { key: "discount", label: "Discount", render: (r) => (
                <input type="number" defaultValue={r.discount || 0} className="w-20 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { discount: Number(e.currentTarget.value) })} />
              ) },
              { key: "stock", label: "Stock", sortable: true, render: (r) => (
                <input type="number" defaultValue={r.stock || 0} className="w-20 px-2 py-1 border rounded" onBlur={(e) => updateField(r._id, { stock: Number(e.currentTarget.value) })} />
              ) },
              { key: "status", label: "Status", render: (r) => (
                <select defaultValue={r.status || "approved"} className="border rounded px-2 py-1" onChange={(e) => updateField(r._id, { status: e.currentTarget.value })}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              ) },
              { key: "_id", label: "Actions", render: (r) => (
                <button onClick={() => deleteProduct(r._id)} className="px-2 py-1 rounded border">Delete</button>
              ) },
            ]}
            data={rows}
            sortKey={sortKey || undefined}
            sortOrder={sortOrder}
            onSortChange={(key, order) => { setSortKey(key); setSortOrder(order) }}
            rowKey={(r) => r._id}
          />
        )}
        <div className="flex items-center justify-between">
          <CommonPagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Add Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded">x</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <CommonDropdown options={categoryOptions} selected={formCategory ? { id: formCategory, label: formCategory } : null} onChange={onFormCategoryChange} placeholder="Select Category" />
                </div>
                {formCategory && subcategoryOptionsFor(formCategory).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                    <CommonDropdown options={subcategoryOptionsFor(formCategory)} selected={formSubcategory ? { id: formSubcategory, label: formSubcategory } : null} onChange={(v) => { if (!Array.isArray(v)) setFormSubcategory(v.label) }} placeholder="Select Subcategory" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input value={formBrand} onChange={e => setFormBrand(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Nike, Apple" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                    <div className="flex gap-1">
                      <input type="number" value={formLength} onChange={e => setFormLength(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Length" />
                      <select value={formLengthUnit} onChange={e => setFormLengthUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                        {dimensionUnits.map(u => <option key={u.id} value={String(u.id)}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <div className="flex gap-1">
                      <input type="number" value={formHeight} onChange={e => setFormHeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Height" />
                      <select value={formDimensionUnit} onChange={e => setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                        {dimensionUnits.map(u => <option key={u.id} value={String(u.id)}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                    <div className="flex gap-1">
                      <input type="number" value={formWidth} onChange={e => setFormWidth(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Width" />
                      <select value={formDimensionUnit} onChange={e => setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                        {dimensionUnits.map(u => <option key={u.id} value={String(u.id)}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <div className="flex gap-1">
                      <input type="number" value={formWeight} onChange={e => setFormWeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Weight" />
                      <select value={formWeightUnit} onChange={e => setFormWeightUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                        {weightUnits.map(u => <option key={u.id} value={String(u.id)}>{u.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
                  <input value={formColors} onChange={e => setFormColors(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Red, Blue, Green" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                  <input value={formSizes} onChange={e => setFormSizes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="S, M, L, XL" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">About Product</label>
                  <textarea value={formAbout} onChange={e => setFormAbout(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
                  <textarea value={formAddInfo} onChange={e => setFormAddInfo(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                      <CommonDropdown options={stateOptions} selected={formSellerState ? { id: formSellerState, label: formSellerState } : null} onChange={onFormSellerStateChange} placeholder="Select State" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="space-y-2">
                        <label className="block text-xs font-medium text-gray-600">Image {index + 1}</label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-2 h-32 flex items-center justify-center bg-gray-50">
                          {images[index] ? (
                            <div className="relative w-full h-full">
                              <FallbackImage src={images[index]} alt={`Image ${index + 1}`} fill className="object-contain rounded" />
                              <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">x</button>
                              <button onClick={() => startCrop(index)} className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-1">crop</button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-gray-400 text-xs">Upload</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleImageSlotChange(index, e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
                {isSubmitting ? "Saving..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
      {croppingImageIndex !== null && images[croppingImageIndex] && (
        <ImageCropper imageSrc={images[croppingImageIndex]} onCancel={() => setCroppingImageIndex(null)} onCropComplete={onCropComplete} />
      )}
    </div>
    )}
    </Suspense>
  )
}

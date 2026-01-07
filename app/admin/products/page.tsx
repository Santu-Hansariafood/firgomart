"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"
import categoriesData from "@/data/categories.json"
import locationData  from "@/data/country.json"
import { Package, Edit, Trash, X, Plus } from "lucide-react"
import dynamic from "next/dynamic"
import FallbackImage from "@/components/common/Image/FallbackImage"
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader"

const AdminLogin = dynamic(() => import("@/components/ui/AdminLogin/AdminLogin"))
const CommonTable = dynamic(() => import("@/components/common/Table/CommonTable"))
const CommonPagination = dynamic(() => import("@/components/common/Pagination/CommonPagination"))
const CommonDropdown = dynamic(() => import("@/components/common/CommonDropdown/CommonDropdown"))
const SearchBox = dynamic(() => import("@/components/common/SearchBox/SearchBox"))
const BackButton = dynamic(() => import("@/components/common/BackButton/BackButton"))

type ProductItem = {
  id: string
  name: string
  category?: string
  subcategory?: string
  price: number
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
}

type DropdownItem = { id: string | number; label: string }

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
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formSubcategory, setFormSubcategory] = useState("")
  const [formPrice, setFormPrice] = useState("")
  const [formStock, setFormStock] = useState("")
  const [formSellerState, setFormSellerState] = useState("")
  const [formGST, setFormGST] = useState(false)
  const [formBrand, setFormBrand] = useState("")
  const [formColors, setFormColors] = useState("")
  const [formSizes, setFormSizes] = useState("")
  const [formAbout, setFormAbout] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formAddInfo, setFormAddInfo] = useState("")
  const [images, setImages] = useState<string[]>([])

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
      const adminEmail = (session?.user?.email || authUser?.email || "").trim()
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", String(pageSize))
      if (category) params.set("category", category)
      if (selectedState?.id && String(selectedGST.id) !== "true") params.set("state", String(selectedState.id))
      if (selectedGST?.id !== undefined && selectedGST.id !== "") params.set("hasGST", String(selectedGST.id))
      if (search) params.set("search", search)
      if (sortKey) params.set("sortBy", String(sortKey))
      params.set("sortOrder", sortOrder)
      const res = await fetch(`/api/admin/products?${params.toString()}`, {
        headers: { ...(adminEmail ? { "x-admin-email": adminEmail } : {}) },
      })
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
  }, [allowed, page, selectedState, selectedGST, search, sortKey, sortOrder, category])

  useEffect(() => {
    if (formGST) setFormSellerState("")
  }, [formGST])

  const openModal = (product?: ProductItem) => {
    if (product) {
      setEditingId(product.id)
      setFormName(product.name)
      setFormCategory(product.category || "")
      setFormSubcategory((product as any).subcategory || "")
      setFormPrice(String(product.price))
      setFormStock(String(product.stock || 0))
      setFormSellerState(product.sellerState || "")
      setFormGST(!!product.sellerHasGST)
      setFormBrand(product.brand || "")
      setFormColors((product.colors || []).join(", "))
      setFormSizes((product.sizes || []).join(", "))
      setFormAbout(product.about || "")
      setFormDesc(product.description || "")
      setFormAddInfo(product.additionalInfo || "")
      setImages(product.images && product.images.length ? product.images : (product.image ? [product.image] : []))
    } else {
      setEditingId(null)
      setFormName("")
      setFormCategory("")
      setFormSubcategory("")
      setFormPrice("")
      setFormStock("")
      setFormSellerState("")
      setFormGST(false)
      setFormBrand("")
      setFormColors("")
      setFormSizes("")
      setFormAbout("")
      setFormDesc("")
      setFormAddInfo("")
      setImages([])
    }
    setIsModalOpen(true)
  }

  const onFiles = async (files: FileList | null) => {
    if (!files) return
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
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    let uploaded: string[] = []
    
    const newImages = images.filter(img => img.startsWith("data:"))
    const existingImages = images.filter(img => !img.startsWith("data:"))
    
    if (newImages.length) {
      try {
        const up = await fetch(`/api/upload/image`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images: newImages }) })
        const upJson = await up.json()
        if (up.ok && Array.isArray(upJson.urls)) {
            uploaded = upJson.urls
        }
      } catch {}
    }
    
    const finalImages = [...existingImages, ...uploaded]
    const adminEmail = (session?.user?.email || authUser?.email || "").trim()

    const payload = {
      name: formName.trim(),
      category: formCategory.trim(),
      subcategory: formSubcategory.trim(),
      price: Number(formPrice),
      stock: Number(formStock || 0),
      sellerState: formGST ? "" : formSellerState.trim(),
      sellerHasGST: formGST,
      images: finalImages,
      image: finalImages[0] || "/file.svg",
      brand: formBrand.trim(),
      colors: formColors.split(",").map(s => s.trim()).filter(Boolean),
      sizes: formSizes.split(",").map(s => s.trim()).filter(Boolean),
      about: formAbout.trim(),
      description: formDesc.trim(),
      additionalInfo: formAddInfo.trim(),
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
      }
    } catch {}
  }

  const handleDelete = async (id: string) => {
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
      }
    } catch {}
  }

  return (
    <Suspense fallback={<BeautifulLoader/>}>
      {!allowed ? (
        <AdminLogin />
      ) : (
        <div className="p-6 space-y-8">
          <BackButton className="mb-2" />
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Product Management</h1>
                <p className="text-indigo-100 text-sm">Create, filter and manage catalog</p>
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
              <div className="px-4 py-6 text-gray-700">Loading…</div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-4">
                <CommonTable
                  columns={[
                    { key: "image", label: "Image", render: (r) => (
                      <FallbackImage src={(r as { image?: string }).image} alt={r.name} width={48} height={48} className="object-cover rounded border" />
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input type="number" value={formStock} onChange={e => setFormStock(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                            <CommonDropdown
                              options={subcategoryOptionsFor(formCategory)}
                              selected={formSubcategory ? { id: formSubcategory, label: formSubcategory } : null}
                              onChange={(v) => { if (!Array.isArray(v)) setFormSubcategory(v.label) }}
                              placeholder="Select Subcategory"
                            />
                          </div>
                        )}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                             <input value={formBrand} onChange={e => setFormBrand(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Nike, Apple" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700">Product Details</h3>
                         <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Colors (comma separated)</label>
                             <input value={formColors} onChange={e => setFormColors(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Red, Blue, Green" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                             <input value={formSizes} onChange={e => setFormSizes(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="S, M, L, XL" />
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
                            <div className="flex items-center gap-2">
                                <input id="gst_modal" type="checkbox" checked={formGST} onChange={(e) => setFormGST(e.target.checked)} />
                                <label htmlFor="gst_modal" className="text-sm font-medium text-gray-700">Seller has GST</label>
                            </div>
                            {!formGST && (
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
                             <h3 className="font-semibold text-gray-700">Images</h3>
                             <input type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} className="text-sm" />
                             <div className="flex flex-wrap gap-2 mt-2">
                                {images.map((src, i) => (
                                    <div key={i} className="relative group">
                                        <FallbackImage src={src} alt="preview" width={80} height={80} className="object-cover rounded border" />
                                        <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 rounded-b-xl">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {editingId ? "Update Product" : "Create Product"}
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Suspense>
  )
}

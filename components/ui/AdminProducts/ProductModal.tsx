import dynamic from "next/dynamic"
import CommonDropdown from "@/components/common/CommonDropdown/CommonDropdown"
import FallbackImage from "@/components/common/Image/FallbackImage"
import { X, Crop } from "lucide-react"

export type DropdownItem = { id: string | number; label: string }

type Props = {
  isOpen: boolean
  onClose: () => void
  editingId: string | null
  currentCurrency: { code: string; symbol: string; html: string }
  countryOptions: DropdownItem[]
  stateOptions: DropdownItem[]
  categoryOptions: DropdownItem[]
  subcategoryOptionsFor: (cat: string) => DropdownItem[]
  dimensionUnits: DropdownItem[]
  weightUnits: DropdownItem[]
  colorOptions: DropdownItem[]
  sizeOptions: DropdownItem[]
  formName: string
  setFormName: (v: string) => void
  formProductId: string
  setFormProductId: (v: string) => void
  formOriginalPrice: string
  setFormOriginalPrice: (v: string) => void
  formPrice: string
  setFormPrice: (v: string) => void
  formStock: string
  setFormStock: (v: string) => void
  formUnitsPerPack: string
  setFormUnitsPerPack: (v: string) => void
  formAvailableCountry: string
  onFormCountryChange: (v: DropdownItem | DropdownItem[]) => void
  formDeliveryTimeDays: string
  setFormDeliveryTimeDays: (v: string) => void
  formCategory: string
  onFormCategoryChange: (v: DropdownItem | DropdownItem[]) => void
  formSubcategory: string
  setFormSubcategory: (v: string) => void
  formBrand: string
  setFormBrand: (v: string) => void
  formLength: string
  setFormLength: (v: string) => void
  formLengthUnit: string
  setFormLengthUnit: (v: string) => void
  formHeight: string
  setFormHeight: (v: string) => void
  formDimensionUnit: string
  setFormDimensionUnit: (v: string) => void
  formWidth: string
  setFormWidth: (v: string) => void
  formWeight: string
  setFormWeight: (v: string) => void
  formWeightUnit: string
  setFormWeightUnit: (v: string) => void
  selectedColorItems: DropdownItem[]
  setSelectedColorItems: (v: DropdownItem[]) => void
  selectedSizeItems: DropdownItem[]
  setSelectedSizeItems: (v: DropdownItem[]) => void
  otherColorInput: string
  setOtherColorInput: (v: string) => void
  otherSizeInput: string
  setOtherSizeInput: (v: string) => void
  applyColorsToForm: (selected: DropdownItem[], othersText: string) => void
  applySizesToForm: (selected: DropdownItem[], othersText: string) => void
  formAbout: string
  setFormAbout: (v: string) => void
  formDesc: string
  setFormDesc: (v: string) => void
  formAddInfo: string
  setFormAddInfo: (v: string) => void
  formHSNCode: string
  setFormHSNCode: (v: string) => void
  formGST: boolean
  setFormGST: (v: boolean) => void
  formGSTNumber: string
  setFormGSTNumber: (v: string) => void
  formSellerState: string
  onFormSellerStateChange: (v: DropdownItem | DropdownItem[]) => void
  images: string[]
  removeImage: (index: number) => void
  startCrop: (index: number) => void
  handleImageSlotChange: (index: number, files: FileList | null) => void
  isComboPack: boolean
  setIsComboPack: (v: boolean) => void
  comboItems: { productId: string; quantity: string }[]
  setComboItems: (updater: (prev: { productId: string; quantity: string }[]) => { productId: string; quantity: string }[]) => void
  productIdOptions: DropdownItem[]
  isSubmitting: boolean
  handleSave: () => void
}

const ImageCropper = dynamic(() => import("@/components/common/ImageCropper/ImageCropper"))

export default function ProductModal(props: Props) {
  if (!props.isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{props.editingId ? "Edit Product" : "Add Product"}</h2>
          <button onClick={props.onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={props.formName} onChange={e => props.setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product ID</label>
              <input value={props.formProductId} onChange={e => props.setFormProductId(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. PID-123" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP ({props.currentCurrency.symbol})</label>
                <input type="number" value={props.formOriginalPrice} onChange={e => props.setFormOriginalPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Original" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ({props.currentCurrency.symbol})</label>
                <input type="number" value={props.formPrice} onChange={e => props.setFormPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Sale" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input type="number" value={props.formStock} onChange={e => props.setFormStock(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" min={1} value={props.formUnitsPerPack} onChange={e => props.setFormUnitsPerPack(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Units per product" />
                <p className="text-xs text-gray-500 mt-1">Enter how many units are in this product listing.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Country</label>
                <CommonDropdown
                  options={props.countryOptions}
                  selected={props.formAvailableCountry ? { id: props.formAvailableCountry, label: props.formAvailableCountry } : null}
                  onChange={props.onFormCountryChange}
                  placeholder="Select Country"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Currency: {props.currentCurrency.code} ({props.currentCurrency.symbol}) | HTML code: {props.currentCurrency.html}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                <input type="number" min={1} value={props.formDeliveryTimeDays} onChange={e => props.setFormDeliveryTimeDays(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 3" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <CommonDropdown options={props.categoryOptions} selected={props.formCategory ? { id: props.formCategory, label: props.formCategory } : null} onChange={props.onFormCategoryChange} placeholder="Select Category" />
            </div>
            {props.formCategory && props.subcategoryOptionsFor(props.formCategory).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product type</label>
                <CommonDropdown
                  options={props.subcategoryOptionsFor(props.formCategory)}
                  selected={props.formSubcategory ? { id: props.formSubcategory, label: props.formSubcategory } : null}
                  onChange={(v) => { if (!Array.isArray(v)) props.setFormSubcategory((v as DropdownItem).label) }}
                  placeholder="Select Product type"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input value={props.formBrand} onChange={e => props.setFormBrand(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Nike, Apple" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                <div className="flex gap-1">
                  <input type="number" value={props.formLength} onChange={e => props.setFormLength(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Length" />
                  <select value={props.formLengthUnit} onChange={e => props.setFormLengthUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                    {props.dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <div className="flex gap-1">
                  <input type="number" value={props.formHeight} onChange={e => props.setFormHeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Height" />
                  <select value={props.formDimensionUnit} onChange={e => props.setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                    {props.dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <div className="flex gap-1">
                  <input type="number" value={props.formWidth} onChange={e => props.setFormWidth(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Width" />
                  <select value={props.formDimensionUnit} onChange={e => props.setFormDimensionUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                    {props.dimensionUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <div className="flex gap-1">
                  <input type="number" value={props.formWeight} onChange={e => props.setFormWeight(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Weight" />
                  <select value={props.formWeightUnit} onChange={e => props.setFormWeightUnit(e.target.value)} className="px-2 py-2 border rounded-lg bg-white">
                    {props.weightUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
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
                options={props.colorOptions}
                selected={props.selectedColorItems}
                onChange={(v) => {
                  if (Array.isArray(v)) {
                    const list = v as DropdownItem[]
                    props.setSelectedColorItems(list)
                    if (list.some((i) => i.id === "others")) props.applyColorsToForm(list, props.otherColorInput)
                    else {
                      props.setOtherColorInput("")
                      props.applyColorsToForm(list, "")
                    }
                  }
                }}
                multiple
                placeholder="Select colors"
              />
              {props.selectedColorItems.some((i) => i.id === "others") && (
                <div className="mt-2">
                  <input
                    value={props.otherColorInput}
                    onChange={(e) => {
                      const val = e.target.value
                      props.setOtherColorInput(val)
                      props.applyColorsToForm(props.selectedColorItems, val)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter custom colors (comma separated)"
                  />
                </div>
              )}
            </div>
            {props.sizeOptions.length > 0 && (
              <div>
                <CommonDropdown
                  label="Sizes"
                  options={props.sizeOptions}
                  selected={props.selectedSizeItems}
                  onChange={(v) => {
                    if (Array.isArray(v)) {
                      const list = v as DropdownItem[]
                      props.setSelectedSizeItems(list)
                      if (list.some((i) => i.id === "others")) props.applySizesToForm(list, props.otherSizeInput)
                      else {
                        props.setOtherSizeInput("")
                        props.applySizesToForm(list, "")
                      }
                    }
                  }}
                  multiple
                  placeholder="Select sizes"
                />
                {props.selectedSizeItems.some((i) => i.id === "others") && (
                  <div className="mt-2">
                    <input
                      value={props.otherSizeInput}
                      onChange={(e) => {
                        const val = e.target.value
                        props.setOtherSizeInput(val)
                        props.applySizesToForm(props.selectedSizeItems, val)
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Enter custom sizes (comma separated)"
                    />
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Product (Short Summary)</label>
              <textarea value={props.formAbout} onChange={e => props.setFormAbout(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={props.formDesc} onChange={e => props.setFormDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea value={props.formAddInfo} onChange={e => props.setFormAddInfo(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Technical specs, warranty info, etc." />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Seller & Tax</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                <input value={props.formHSNCode} onChange={e => props.setFormHSNCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="HSN Code" />
              </div>
              <div className="flex items-center gap-2">
                <input id="gst_modal" type="checkbox" checked={props.formGST} onChange={(e) => props.setFormGST(e.target.checked)} />
                <label htmlFor="gst_modal" className="text-sm font-medium text-gray-700">Seller has GST</label>
              </div>
              {props.formGST ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input value={props.formGSTNumber} onChange={e => props.setFormGSTNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="GST Number" maxLength={15} />
                  {props.formSellerState && <p className="text-xs text-green-600 mt-1">Detected State: {props.formSellerState}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller State</label>
                  <CommonDropdown options={props.stateOptions} selected={props.formSellerState ? { id: props.formSellerState, label: props.formSellerState } : null} onChange={props.onFormSellerStateChange} placeholder="Select State" />
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
                      {props.images[index] ? (
                        <div className="relative w-full h-full group">
                          <FallbackImage src={props.images[index]} alt={`Image ${index + 1}`} fill className="object-contain rounded" />
                          <button onClick={() => props.removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm">
                            <X className="w-3 h-3" />
                          </button>
                          <button onClick={() => props.startCrop(index)} className="absolute bottom-1 right-1 bg-brand-purple text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm" title="Crop">
                            <Crop className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-gray-400 text-xs">Upload</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => props.handleImageSlotChange(index, e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={!!props.images[index]} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4 px-6 pb-2">
          <h3 className="font-semibold text-gray-700">Combo Pack (optional)</h3>
          <div className="flex items-center gap-2">
            <input id="combo_pack_toggle" type="checkbox" checked={props.isComboPack} onChange={e => props.setIsComboPack(e.target.checked)} />
            <label htmlFor="combo_pack_toggle" className="text-sm font-medium text-gray-700">Treat this listing as a combo pack</label>
          </div>
          {props.isComboPack && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Add one or more underlying products by their Product ID and quantity.</p>
              {props.comboItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <CommonDropdown
                    options={props.productIdOptions}
                    selected={
                      item.productId
                        ? props.productIdOptions.find((opt) => String(opt.id) === String(item.productId)) || null
                        : null
                    }
                    onChange={(v) => {
                      if (!Array.isArray(v)) {
                        const chosen = v as DropdownItem
                        props.setComboItems(prev => prev.map((it, i) => (i === idx ? { ...it, productId: String(chosen.id) } : it)))
                      }
                    }}
                    placeholder="Select Product ID"
                    className="col-span-2"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => {
                      const val = e.target.value
                      props.setComboItems(prev => prev.map((it, i) => (i === idx ? { ...it, quantity: val } : it)))
                    }}
                    placeholder="Qty"
                    className="px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button type="button" onClick={() => props.setComboItems(prev => [...prev, { productId: "", quantity: "1" }])} className="px-3 py-1 text-sm bg-white border border-brand-purple text-brand-purple rounded-lg hover:bg-brand-purple/5">Add product to combo</button>
                {props.comboItems.length > 1 && (
                  <button type="button" onClick={() => props.setComboItems(prev => prev.slice(0, -1))} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Remove last</button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t flex justify-end gap-3 bg-white z-10 sticky bottom-0">
          <button onClick={props.onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium" disabled={props.isSubmitting}>Cancel</button>
          <button onClick={props.handleSave} className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled={props.isSubmitting}>
            {props.isSubmitting ? "Saving..." : (props.editingId ? "Update Product" : "Submit")}
          </button>
        </div>
      </div>
    </div>
  )
}

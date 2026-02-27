"use client"

import React, { useEffect, useState } from "react"
import Barcode from "react-barcode"
import { QRCodeSVG } from "qrcode.react"
import { Printer } from "lucide-react"

class ComponentErrorBoundary extends React.Component<{children: React.ReactNode, fallback?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Component Error:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="text-red-500 text-xs border border-red-300 p-1">Error</div>
    }
    return this.props.children
  }
}

interface PrintOrderProps {
  order: any
  sellerGroups: {
    seller: any
    items: any[]
    taxDetails: {
      taxable: number
      cgst: number
      sgst: number
      igst: number
      total: number
    }
  }[]
  shipment: any
  adminGst: string
}

export default function OrderPrint({ order, sellerGroups, shipment, adminGst }: PrintOrderProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  if (!mounted) return <div className="p-8 text-center">Loading print preview...</div>

  console.log("OrderPrint rendering with:", { order, sellerGroups, shipment })

  // Format currency
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(n)

  const fmtDate = (d: string | Date) => {
    if (!d) return ""
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const overallTotal = Array.isArray(sellerGroups)
    ? sellerGroups.reduce((sum, g) => sum + Number(g?.taxDetails?.total || 0), 0)
    : 0
  const promoCode = typeof order?.promoCode === "string" ? order.promoCode : ""
  const promoDiscount = Number(order?.promoDiscount || 0)
  const amountPayable = Math.max(0, overallTotal - (isFinite(promoDiscount) ? promoDiscount : 0))

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      <div className="mb-8 flex justify-between items-center max-w-[210mm] mx-auto print:hidden">
        <h1 className="text-2xl font-bold text-gray-800">Order Print Preview</h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-brand-purple text-white px-6 py-2 rounded-lg hover:bg-brand-purple/90 transition-colors"
        >
          <Printer size={20} />
          Print Documents
        </button>
      </div>

      <div className="print-content max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none">
        {sellerGroups.map((group, idx) => {
          const { seller, items, taxDetails } = group
          const sellerAddress = [seller.address, seller.city, seller.state, seller.pincode]
            .filter(Boolean)
            .join(", ")
          
          const buyerState = (order.state || "").trim().toLowerCase()
          const sellerState = (seller.state || "").trim().toLowerCase()
          const isIntrastate = buyerState && sellerState && buyerState === sellerState

          return (
            <div key={idx} className="page-break-after-always min-h-[297mm] p-8 flex flex-col relative border-b-2 border-dashed border-gray-300 print:border-none">
              <div className="border-2 border-black mb-8 relative">
                <div className="flex border-b-2 border-black">
                  <div className="w-2/3 p-2 border-r-2 border-black">
                    <div className="font-bold text-lg">STD</div>
                    <div className="text-sm">{shipment?.courier || "Shiprocket"}</div>
                    <div className="text-xs">{shipment?.trackingNumber || "AWB Pending"}</div>
                  </div>
                  <div className="w-1/3 p-2 flex flex-col justify-center items-center bg-gray-100">
                    <div className="font-bold text-xl">{shipment?.courier === "E-Kart" ? "E" : "S"}</div>
                    <div className="text-xs font-bold">{order.paymentMethod === "COD" ? "COD" : "PREPAID"}</div>
                  </div>
                </div>

                <div className="flex h-48">
                  <div className="w-1/4 p-2 border-r-2 border-black flex flex-col justify-between items-center">
                    <div className="rotate-90 origin-center whitespace-nowrap text-xs mt-12">
                      {order.state?.substring(0, 15)} / {order.city?.substring(0, 15)}
                    </div>
                    <div className="mt-auto mb-2">
                      <QRCodeSVG value={order.orderNumber} size={60} />
                    </div>
                  </div>

                  <div className="w-1/2 p-2 border-r-2 border-black flex flex-col items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <ComponentErrorBoundary fallback={<div className="text-[10px]">Barcode Error</div>}>
                        <Barcode 
                          value={shipment?.trackingNumber || order.orderNumber || "UNKNOWN"} 
                          width={1.5} 
                          height={60} 
                          fontSize={12} 
                        />
                      </ComponentErrorBoundary>
                    </div>
                  </div>

                  <div className="w-1/4 p-2 text-xs overflow-hidden">
                    <div className="font-bold mb-1">Shipping Address:</div>
                    <div className="font-semibold">{order.buyerName}</div>
                    <div>{order.address}</div>
                    <div>
                      {order.city}, {order.state}
                    </div>
                    <div className="font-bold">PIN: {order.pincode}</div>
                    <div>Ph: {order.buyerEmail}</div>
                  </div>
                </div>

                <div className="border-t-2 border-black p-2 text-xs flex justify-between">
                  <div className="w-1/2 pr-2 border-r border-black">
                    <span className="font-bold">Sold By:</span> {seller.businessName}
                    <br />
                    {sellerAddress}
                  </div>
                  <div className="w-1/2 pl-2">
                    <span className="font-bold">Return To:</span>
                    <br />
                    {sellerAddress}
                  </div>
                </div>

                <div className="border-t-2 border-black">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="p-1 text-left w-10">#</th>
                        <th className="p-1 text-left">Product / SKU</th>
                        <th className="p-1 text-right w-10">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-300 last:border-0">
                          <td className="p-1">{i + 1}</td>
                          <td className="p-1">
                            <div className="font-semibold">{(item.name || "Unknown Product").substring(0, 40)}</div>
                            <div className="text-[10px] text-gray-500">
                              SKU: {item.productId}
                              {(item.selectedSize || item.selectedColor) && (
                                <span className="ml-1">
                                  {item.selectedSize && `| Size: ${item.selectedSize} `}
                                  {item.selectedColor && `| Color: ${item.selectedColor}`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-1 text-right">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t-2 border-black p-2 flex justify-between items-center">
                  <div className="h-12 overflow-hidden">
                     <ComponentErrorBoundary fallback={<div className="text-[10px]">Barcode Error</div>}>
                        <Barcode value={order.orderNumber || "UNKNOWN"} width={1} height={30} displayValue={false} />
                     </ComponentErrorBoundary>
                     <div className="text-[10px] text-center">{order.orderNumber}</div>
                  </div>
                  <div className="text-[10px] text-right">
                    <div>Not for resale</div>
                    <div>Printed: {new Date().toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="border-b-2 border-dashed border-gray-400 my-4"></div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wide">Tax Invoice</h2>
                    <div className="text-xs mt-1 space-y-0.5">
                      <div><span className="font-semibold">Order ID:</span> {order.orderNumber}</div>
                      <div><span className="font-semibold">Order Date:</span> {fmtDate(order.createdAt)}</div>
                      <div><span className="font-semibold">Invoice Date:</span> {fmtDate(new Date().toISOString())}</div>
                      {order.promoCode && (
                        <div className="text-green-700">
                          <span className="font-semibold">Promo Code:</span> {order.promoCode}
                          {typeof order.promoDiscount === "number" && order.promoDiscount > 0 && (
                            <span className="ml-2">(Discount: {fmt(Number(order.promoDiscount || 0))})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <div><span className="font-semibold">Invoice No:</span> {order.orderNumber.replace("ORD", "INV")}</div>
                    <div><span className="font-semibold">GSTIN:</span> {seller.gstNumber || adminGst}</div>
                    <div><span className="font-semibold">PAN:</span> {seller.panNumber || "—"}</div>
                    <div className="mt-2 w-24 h-24 ml-auto">
                      <ComponentErrorBoundary fallback={<div className="text-[10px]">QR Error</div>}>
                        <QRCodeSVG value={`Order:${order.orderNumber}|Amt:${taxDetails.total}`} size={80} />
                      </ComponentErrorBoundary>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs mb-6 border-b pb-4">
                  <div className="w-[32%]">
                    <div className="font-bold mb-1 uppercase text-gray-600">Sold By</div>
                    <div className="font-bold">{seller.businessName}</div>
                    <div>{sellerAddress}</div>
                    <div className="mt-1 font-semibold">GST: {seller.gstNumber || "Unregistered"}</div>
                  </div>
                  <div className="w-[32%]">
                    <div className="font-bold mb-1 uppercase text-gray-600">Billing Address</div>
                    <div className="font-bold">{order.buyerName}</div>
                    <div>{order.address}</div>
                    <div>{order.city}, {order.state} - {order.pincode}</div>
                    <div>Ph: {order.buyerEmail}</div>
                  </div>
                  <div className="w-[32%]">
                    <div className="font-bold mb-1 uppercase text-gray-600">Shipping Address</div>
                    <div className="font-bold">{order.buyerName}</div>
                    <div>{order.address}</div>
                    <div>{order.city}, {order.state} - {order.pincode}</div>
                    <div>Ph: {order.buyerEmail}</div>
                  </div>
                </div>

                <table className="w-full text-xs mb-6">
                  <thead className="bg-gray-100 border-y border-gray-300">
                    <tr>
                      <th className="py-2 text-left">Product</th>
                      <th className="py-2 text-right">Qty</th>
                      <th className="py-2 text-right">Gross Amount</th>
                      <th className="py-2 text-right">Discount</th>
                      <th className="py-2 text-right">Taxable Value</th>
                      {!isIntrastate ? (
                        <th className="py-2 text-right">IGST</th>
                      ) : (
                        <>
                          <th className="py-2 text-right">CGST</th>
                          <th className="py-2 text-right">SGST</th>
                        </>
                      )}
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item: any, i: number) => {
                      const qty = item.quantity
                      const price = item.price
                      
                      let originalPrice = price
                      let discountTotal = 0
                      
                      if (item.appliedOffer && item.appliedOffer.value) {
                         const val = Number(item.appliedOffer.value)
                         if (!isNaN(val) && val > 0 && val < 100) {
                            originalPrice = Math.round(price / (1 - val/100))
                            discountTotal = (originalPrice - price) * qty
                         }
                      }

                      const taxable = qty * price
                      const grossAmount = qty * originalPrice
                      
                      const gstPercent = item.gstPercent || 18
                      const gstAmount = item.gstAmount || ((taxable * gstPercent) / 100)
                      
                      const cgst = isIntrastate ? gstAmount / 2 : 0
                      const sgst = isIntrastate ? gstAmount / 2 : 0
                      const igst = isIntrastate ? 0 : gstAmount
                      const total = taxable + gstAmount
                      
                      return (
                        <tr key={i}>
                          <td className="py-2">
                            <div className="font-semibold">{item.name || "Unknown Product"}</div>
                            <div className="text-[10px] text-gray-500">
                              HSN: {item.hsnCode || "90172010"} | GST: {gstPercent}%
                              {(item.selectedSize || item.selectedColor) && (
                                <span className="ml-1">
                                  {item.selectedSize && `| Size: ${item.selectedSize} `}
                                  {item.selectedColor && `| Color: ${item.selectedColor}`}
                                </span>
                              )}
                              {item.appliedOffer && (
                                <div className="text-green-600 font-medium mt-0.5">
                                   Offer: {item.appliedOffer.name} ({item.appliedOffer.value}% Off)
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 text-right">{qty}</td>
                          <td className="py-2 text-right">{fmt(grossAmount)}</td>
                          <td className="py-2 text-right">{fmt(discountTotal)}</td>
                          <td className="py-2 text-right">{fmt(taxable)}</td>
                          {!isIntrastate ? (
                            <td className="py-2 text-right">{fmt(igst)}</td>
                          ) : (
                            <>
                              <td className="py-2 text-right">{fmt(cgst)}</td>
                              <td className="py-2 text-right">{fmt(sgst)}</td>
                            </>
                          )}
                          <td className="py-2 text-right font-bold">{fmt(total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-800 font-bold bg-gray-50">
                     <tr>
                        <td className="py-2">TOTAL</td>
                        <td className="py-2 text-right">{items.reduce((s:number, i:any) => s + i.quantity, 0)}</td>
                        <td className="py-2 text-right" colSpan={!isIntrastate ? 4 : 5}></td>
                        <td className="py-2 text-right">{fmt(taxDetails.total)}</td>
                     </tr>
                     {/** Display order-level promo info on the first page only to avoid repetition */}
                     {order?.promoCode && idx === 0 && (
                       <tr>
                         <td className="py-2 text-green-700">Promo ({order.promoCode})</td>
                         <td className="py-2 text-right">—</td>
                         <td className="py-2 text-right" colSpan={!isIntrastate ? 4 : 5}></td>
                         <td className="py-2 text-right text-green-700">- {fmt(Number(order.promoDiscount || 0))}</td>
                       </tr>
                     )}
                  </tfoot>
                </table>
                {idx === 0 && (
                  <div className="mt-3 ml-auto w-full max-w-xs border border-gray-300 rounded-lg p-3 text-xs bg-white">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Order Total</span>
                      <span className="font-bold">{fmt(overallTotal)}</span>
                    </div>
                    {promoCode && promoDiscount > 0 && (
                      <div className="flex justify-between mb-1 text-green-700">
                        <span>Promo ({promoCode})</span>
                        <span className="font-bold">- {fmt(promoDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
                      <span className="font-semibold">Amount Payable</span>
                      <span className="font-bold">{fmt(amountPayable)}</span>
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-4 border-t border-gray-300 text-xs flex justify-between items-end">
                  <div className="max-w-[60%]">
                    <div className="font-bold">Seller Registered Address:</div>
                    <div>{seller.businessName}, {sellerAddress}</div>
                    <div className="mt-2">
                        This is a computer generated invoice. No signature required.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="border border-gray-300 p-2 mb-1 w-32 h-16 flex items-center justify-center text-gray-400 italic">
                        [Signature]
                    </div>
                    <div>Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; }
          .page-break-after-always { break-after: page; }
        }
      `}</style>
    </div>
  )
}

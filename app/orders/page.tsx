 "use client";
 
 import { useEffect, useState, Suspense } from "react";
 import Link from "next/link";
 import { useAuth } from "@/context/AuthContext";
 import { motion } from "framer-motion";
 import { Truck, FileText, X } from "lucide-react";
 import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
 import Image from "@/components/common/Image/FallbackImage";
 import BackButton from "@/components/common/BackButton/BackButton";
 
 type BuyerOrder = {
   id: string;
   orderNumber?: string;
   amount?: number;
   status?: string;
   createdAt?: string;
 };
 
 const OrdersPage = () => {
   const { user } = useAuth();
   const [orders, setOrders] = useState<BuyerOrder[]>([]);
   const [loadingOrders, setLoadingOrders] = useState(false);
   const [trackingModalOpen, setTrackingModalOpen] = useState(false);
   const [trackingData, setTrackingData] = useState<any>(null);
   const [loadingTracking, setLoadingTracking] = useState(false);
 
   const statusBadgeClass = (s?: string) => {
     const t = String(s || "").toLowerCase();
     if (t === "pending") return "bg-yellow-100 text-yellow-800";
     if (["paid", "processing", "shipped"].includes(t)) return "bg-purple-100 text-purple-800";
     if (["delivered", "completed"].includes(t)) return "bg-green-100 text-green-800";
     if (["cancelled", "refunded", "returned"].includes(t)) return "bg-red-100 text-red-800";
     return "bg-gray-100 text-gray-800";
   };
 
   const loadOrders = async () => {
     const email = user?.email || "";
     if (!email) { setOrders([]); return; }
     setLoadingOrders(true);
     try {
       const res = await fetch(`/api/buyer/orders?email=${encodeURIComponent(email)}&limit=50`);
       const data = await res.json();
       if (res.ok) setOrders(Array.isArray(data.orders) ? data.orders : []);
       else setOrders([]);
     } catch {
       setOrders([]);
     }
     setLoadingOrders(false);
   };
 
   useEffect(() => { loadOrders(); }, [user?.email]);
 
   const handleTrackOrder = async (orderId: string) => {
     setLoadingTracking(true);
     setTrackingModalOpen(true);
     setTrackingData(null);
     try {
       const res = await fetch(`/api/orders/${orderId}/tracking`);
       if (res.ok) {
         const data = await res.json();
         setTrackingData(data.tracking || data);
       }
     } catch {}
     setLoadingTracking(false);
   };
 
   return (
     <Suspense fallback={<BeautifulLoader />}>
     <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
       <section className="relative py-16 bg-brand-purple/10 overflow-hidden">
         <div className="max-w-4xl mx-auto px-4 sm:px-8">
           <div className="flex items-center justify-between mb-4">
             <BackButton href="/" label="Back to Home" />
           </div>
           <div className="text-center">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <div className="flex items-center justify-center gap-3 mb-4">
                 <Image src="/logo/firgomart.png" alt="FirgoMart" width={40} height={40} frameless className="rounded-lg" />
                 <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
               </div>
               <p className="text-[var(--foreground)/70]">
                 View and track your previous orders.
               </p>
             </motion.div>
           </div>
         </div>
       </section>
 
       <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
         <div className="bg-[var(--background)] rounded-2xl shadow-lg border border-[var(--foreground)/10]">
           <div className="p-6">
             {loadingOrders ? (
               <div className="text-gray-600">Loading...</div>
             ) : orders.length === 0 ? (
               <div className="text-gray-600">No orders yet</div>
             ) : (
               <div className="space-y-3">
                 {orders.map(o => (
                   <div key={o.id} className="border rounded-lg p-4 space-y-3">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                       <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <button onClick={() => handleTrackOrder(o.id)} className="font-medium hover:text-brand-purple hover:underline text-left">
                             Order {o.orderNumber || o.id}
                           </button>
                           <span className={`text-xs px-2 py-1 rounded ${statusBadgeClass(o.status)}`}>{String(o.status || "").toUpperCase()}</span>
                         </div>
                         <div className="text-sm text-gray-900 font-semibold">₹{Number(o.amount || 0).toFixed(2)}</div>
                         <div className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</div>
                       </div>
                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => handleTrackOrder(o.id)} 
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                         >
                           <Truck className="w-4 h-4" />
                           Track
                         </button>
                         <Link 
                           href={`/api/orders/${encodeURIComponent(o.id)}/receipt`} 
                           className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors text-sm font-medium"
                         >
                           <FileText className="w-4 h-4" />
                           Receipt
                         </Link>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
       </div>
 
       {trackingModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
              <button 
                onClick={() => setTrackingModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold mb-4">Track Order</h3>
              {loadingTracking ? (
                 <div className="py-8 text-center text-gray-600">Loading tracking info...</div>
              ) : trackingData ? (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Order Number</div>
                        <div className="font-semibold text-gray-900">{trackingData.orderNumber}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase">Status</div>
                        <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass(trackingData.status)}`}>
                           {(trackingData.status || "").toUpperCase()}
                        </div>
                      </div>
                    </div>
                    {trackingData.tracking && Array.isArray(trackingData.tracking) && trackingData.tracking.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg border space-y-3">
                        <div className="text-xs text-gray-500 uppercase font-semibold">Tracking Information</div>
                        <div className="space-y-3">
                          {trackingData.tracking.map((t: any, idx: number) => (
                            <div key={idx} className="flex flex-col text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                              <span className="font-medium text-gray-900">Tracking #: {t.number}</span>
                              {t.url && (
                                <a 
                                  href={t.url.startsWith('http') ? t.url : `https://${t.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-brand-purple hover:underline break-all flex items-center gap-1 mt-1"
                                >
                                  Track Package ↗
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(trackingData.courier || trackingData.trackingNumber) && (
                      <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                        {trackingData.courier && (
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Courier</div>
                            <div className="font-medium text-gray-900">{trackingData.courier}</div>
                          </div>
                        )}
                        {trackingData.trackingNumber && (
                          <div>
                            <div className="text-xs text-gray-500 uppercase">Tracking Number</div>
                            <div className="font-medium text-gray-900 font-mono">{trackingData.trackingNumber}</div>
                          </div>
                        )}
                      </div>
                    )}
 
                    {trackingData.lastUpdate && (
                      <div>
                         <div className="text-xs text-gray-500 uppercase">Last Update</div>
                         <div className="text-sm text-gray-800">{new Date(trackingData.lastUpdate).toLocaleString()}</div>
                      </div>
                    )}
                    
                    {!trackingData.courier && !trackingData.trackingNumber && (
                      <div className="text-sm text-gray-600 italic">
                        Tracking details will be updated once the order is shipped.
                      </div>
                    )}
 
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 uppercase mb-2">Tracking History</div>
                      {trackingData.events && trackingData.events.length > 0 ? (
                        <ul className="space-y-2">
                          {trackingData.events.map((event: any, index: number) => (
                            <li key={index} className="text-sm text-gray-600">
                              {new Date(event.time).toLocaleString()}: {event.status} {event.location && `at ${event.location}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">No tracking events available yet.</p>
                      )}
                    </div>
                 </div>
              ) : (
                 <div className="text-center py-4 text-gray-500">Tracking information not available</div>
              )}
           </div>
         </div>
       )}
     </div>
     </Suspense>
   );
 };
 
 export default OrdersPage;

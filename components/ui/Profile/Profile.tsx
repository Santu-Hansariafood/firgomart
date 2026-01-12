"use client";

import { useState, ChangeEvent, useEffect, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "@/components/common/Image/FallbackImage";
import { Truck, FileText, User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";

interface UserData {
  name?: string;
  email?: string;
  mobile?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addresses?: Array<{
    name?: string;
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isDefault?: boolean;
  }>;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  pincode?: string;
}

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData>(user || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber?: string; amount?: number; status?: string; createdAt?: string }>>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false
  })

  const [trackingModalOpen, setTrackingModalOpen] = useState(false)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)

  const handleTrackOrder = async (orderId: string) => {
    setLoadingTracking(true)
    setTrackingModalOpen(true)
    setTrackingData(null)
    try {
        const res = await fetch(`/api/orders/${orderId}/tracking`)
        if (res.ok) {
            const data = await res.json()
            setTrackingData(data.tracking || data)
        }
    } catch {}
    setLoadingTracking(false)
  }

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, ...user }))
    }
  }, [user])

  const getInitials = (n?: string | null, e?: string | null) => {
    const name = String(n || "").trim()
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean)
      const first = (parts[0] || "").charAt(0).toUpperCase()
      const last = (parts[parts.length - 1] || "").charAt(0).toUpperCase()
      return parts.length >= 2 ? `${first}${last}` : first
    }
    const email = String(e || "").trim()
    if (email) {
      const local = email.split("@")[0] || ""
      const segs = local.split(/[.\-_]+/).filter(Boolean)
      const f = (segs[0] || local).charAt(0).toUpperCase()
      const l = (segs[segs.length - 1] || "").charAt(0).toUpperCase()
      return segs.length >= 2 ? `${f}${l}` : f
    }
    return ""
  }
  const initials = getInitials(user?.name, user?.email)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile))
      newErrors.mobile = "Invalid mobile number";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Invalid pincode";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      updateUser(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setErrors({});
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.city || !newAddress.pincode) return
    const updatedAddresses = [...(formData.addresses || [])]
    if (newAddress.isDefault) {
      updatedAddresses.forEach(a => a.isDefault = false)
    }
    updatedAddresses.push({ ...newAddress })
    const updatedData = { ...formData, addresses: updatedAddresses }
    setFormData(updatedData)
    updateUser({ addresses: updatedAddresses } as any)
    setNewAddress({
      name: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false
    })
    setShowAddAddress(false)
  }

  const handleDeleteAddress = (index: number) => {
    const updatedAddresses = [...(formData.addresses || [])]
    updatedAddresses.splice(index, 1)
    const updatedData = { ...formData, addresses: updatedAddresses }
    setFormData(updatedData)
    updateUser({ addresses: updatedAddresses } as any)
  }

  const handleSetDefault = (index: number) => {
    const updatedAddresses = (formData.addresses || []).map((addr, i) => ({
      ...addr,
      isDefault: i === index
    }))
    const updatedData = { ...formData, addresses: updatedAddresses }
    setFormData(updatedData)
    updateUser({ addresses: updatedAddresses } as any)
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusBadgeClass = (s?: string) => {
    const t = String(s || "").toLowerCase();
    if (t === "pending") return "bg-yellow-100 text-yellow-800";
    if (["paid", "processing", "shipped"].includes(t)) return "bg-purple-100 text-purple-800";
    if (["delivered", "completed"].includes(t)) return "bg-green-100 text-green-800";
    if (["cancelled", "refunded", "returned"].includes(t)) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const loadOrders = async () => {
    const email = user?.email || ""
    if (!email) { setOrders([]); return }
    setLoadingOrders(true)
    try {
      const res = await fetch(`/api/buyer/orders?email=${encodeURIComponent(email)}&limit=50`)
      const data = await res.json()
      if (res.ok) setOrders(Array.isArray(data.orders) ? data.orders : [])
      else setOrders([])
    } catch { setOrders([]) }
    setLoadingOrders(false)
  }

  useEffect(() => { loadOrders() }, [user?.email])

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-brand-purple to-purple-400 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-brand-purple">
                  <span className="text-5xl font-black text-brand-purple tracking-wider leading-none">{initials}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-purple-100 mt-1">
                    {user.email || user.mobile}
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 p-4 border rounded-lg bg-[var(--background)] border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-lg font-medium text-[var(--foreground)]">{(formData.name || "").trim() || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-lg font-medium text-[var(--foreground)]">{(formData.email || "").trim() || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Mobile</div>
                  <div className="text-lg font-medium text-[var(--foreground)]">{(formData.mobile || "").trim() || "—"}</div>
                </div>
              </div>
            </div>
            <div className="mb-6 p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Delivery Address</span>
              </div>
              <p className="text-sm text-green-900">
                {(formData.address || "").trim()
                  ? `${formData.address}`
                  : "No address on file"}
              </p>
              <p className="text-sm text-green-900">
                {[
                  (formData.city || "").trim(),
                  (formData.state || "").trim(),
                  (formData.pincode || "").trim(),
                ]
                  .filter(Boolean)
                  .join(", ") || ""}
              </p>
              <p className="text-xs text-green-700 mt-2">
                Using your registered address as delivery address for now.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                name="name"
                icon={<User className="w-5 h-5 text-gray-400" />}
                value={formData.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.name}
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                icon={<Mail className="w-5 h-5 text-gray-400" />}
                value={formData.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.email}
              />

              <InputField
                label="Mobile Number"
                name="mobile"
                type="tel"
                icon={<Phone className="w-5 h-5 text-gray-400" />}
                value={formData.mobile || ""}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.mobile}
              />

              <InputField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                icon={<Calendar className="w-5 h-5 text-gray-400" />}
                value={formData.dateOfBirth || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <SelectField
                label="Gender"
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-6 text-[var(--foreground)]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                    !isEditing ? "bg-gray-50" : ""
                  } border-gray-300`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <SimpleInput
                label="City"
                name="city"
                value={formData.city || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <SimpleInput
                label="State"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <SimpleInput
                label="Pincode"
                name="pincode"
                value={formData.pincode || ""}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.pincode}
              />
            </div>

            {isEditing && (
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-purple to-purple-400 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-500 transition-all"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-4 py-2 bg-purple-50 text-brand-purple hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"
                >
                  {showAddAddress ? "Cancel" : "Add New Address"}
                </button>
              </div>

              {showAddAddress && (
                  <div className="mb-6 p-6 bg-[var(--background)] rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <SimpleInput
                      label="Name"
                      name="newName"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    />
                    <SimpleInput
                      label="Mobile"
                      name="newMobile"
                      value={newAddress.mobile}
                      onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        rows={2}
                      />
                    </div>
                    <SimpleInput
                      label="City"
                      name="newCity"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                    <SimpleInput
                      label="State"
                      name="newState"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                    <SimpleInput
                      label="Pincode"
                      name="newPincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="w-4 h-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                  </div>
                  <button
                    onClick={handleAddAddress}
                    disabled={!newAddress.address || !newAddress.city || !newAddress.pincode}
                    className="w-full py-3 bg-brand-purple text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formData.addresses || []).map((addr, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${addr.isDefault ? "border-brand-purple bg-purple-50" : "border-gray-200 bg-[var(--background)]"} relative group`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-[var(--foreground)]">{addr.name || formData.name}</div>
                          <div className="text-sm text-gray-500">{addr.mobile || formData.mobile}</div>
                        </div>
                        {addr.isDefault && (
                          <span className="px-2 py-1 bg-purple-100 text-brand-purple text-xs font-medium rounded">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground)] mb-3">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        {!addr.isDefault && (
                          <button
                          onClick={() => handleSetDefault(idx)}
                          className="text-brand-purple hover:text-purple-800 font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {(!formData.addresses || formData.addresses.length === 0) && (
                  <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                    No additional addresses saved.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] text-[var(--foreground)] rounded-2xl shadow-lg overflow-hidden mt-6"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Previous Orders</h2>
              <div className="flex items-center gap-2">
                <Image src="/logo/firgomart.png" alt="FirgoMart" width={32} height={32} frameless className="rounded-md" />
                <span className="text-sm text-gray-600">FirgoMart</span>
              </div>
            </div>
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
        </motion.div>
      </div>

      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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
  );
};

export default Profile;

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  error?: string;
}

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
  icon,
  error,
}: InputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
          !disabled ? "" : "bg-gray-50"
        } ${error ? "border-red-500" : "border-gray-300"}`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SimpleInput = ({
  label,
  name,
  value,
  onChange,
  disabled,
  error,
}: Omit<InputProps, "icon" | "type">) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
        disabled ? "bg-gray-50" : ""
      } ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple ${
        disabled ? "bg-gray-50" : ""
      } border-gray-300`}
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

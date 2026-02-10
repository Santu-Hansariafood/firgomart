"use client";

import { useState, ChangeEvent, useEffect, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, Calendar, Edit2, X, LogOut, Plus } from "lucide-react";
import { LocationDetector, LocationData } from "@/components/common/LocationDetector/LocationDetector";

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

  const handleLocationDetected = (data: LocationData) => {
    setFormData(prev => ({
      ...prev,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode
    }));
  };

  const handleNewAddressLocationDetected = (data: LocationData) => {
    setNewAddress(prev => ({
      ...prev,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode
    }));
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-8 pb-32 sm:pt-12 sm:pb-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-[var(--foreground)] tracking-tight">Account Settings</h1>
            <p className="text-[var(--foreground)]/60 mt-1">Manage your profile and preferences</p>
          </div>
          <Link 
            href="/"
            className="group self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)]/80 hover:text-brand-purple transition-all duration-300 font-medium text-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            <span>Back to Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--background)] rounded-3xl shadow-xl overflow-hidden border border-[var(--foreground)/10]"
        >
          <div className="relative bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-8">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-br from-brand-purple to-brand-red rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                  <div className="relative w-24 h-24 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <span className="text-3xl font-bold bg-gradient-to-br from-brand-purple to-brand-red bg-clip-text text-transparent">
                        {initials}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-[var(--foreground)] tracking-tight break-words">
                    {user.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {user.email && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-[var(--foreground)]/70 max-w-full">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </span>
                    )}
                    {user.mobile && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-xs font-medium text-[var(--foreground)]/70">
                        <Phone className="w-3 h-3" />
                        {user.mobile}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/25 font-medium text-sm overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Edit2 className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-full border border-gray-200 dark:border-zinc-700 text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 rounded-full bg-brand-purple text-white hover:bg-brand-purple/90 transition-all shadow-lg shadow-brand-purple/25 font-medium text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 sm:p-10 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                       <User className="w-5 h-5 text-brand-purple" />
                       Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Full Name"
                        name="name"
                        icon={<User className="w-4 h-4 text-[var(--foreground)/40]" />}
                        value={formData.name || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.name}
                      />
                      <InputField
                        label="Email Address"
                        name="email"
                        type="email"
                        icon={<Mail className="w-4 h-4 text-[var(--foreground)/40]" />}
                        value={formData.email || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.email}
                      />
                      <InputField
                        label="Mobile Number"
                        name="mobile"
                        type="tel"
                        icon={<Phone className="w-4 h-4 text-[var(--foreground)/40]" />}
                        value={formData.mobile || ""}
                        onChange={handleChange}
                        disabled={!isEditing}
                        error={errors.mobile}
                      />
                      <InputField
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        icon={<Calendar className="w-4 h-4 text-[var(--foreground)/40]" />}
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-brand-purple" />
                       Primary Address
                    </h3>
                    {isEditing && (
                      <LocationDetector onLocationDetected={handleLocationDetected} />
                    )}
                    </div>
                    <div className="space-y-6">
                        <div className="relative">
                           <textarea
                             name="address"
                             value={formData.address || ""}
                             onChange={handleChange}
                             disabled={!isEditing}
                             rows={3}
                             placeholder="Street address, apartment, suite, etc."
                             className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple bg-[var(--background)] text-[var(--foreground)] resize-none transition-all ${
                               !isEditing ? "opacity-70 bg-gray-50 dark:bg-zinc-800/50" : "bg-white dark:bg-zinc-900"
                             } border-gray-200 dark:border-zinc-700`}
                           />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                    </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="p-6 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700">
                      <div className="flex items-center gap-2 text-[var(--foreground)] mb-4">
                        <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                           <MapPin className="w-4 h-4 text-brand-purple" />
                        </div>
                        <span className="font-bold">Default Delivery Address</span>
                      </div>
                      
                      {formData.address ? (
                          <div className="space-y-1 text-sm text-[var(--foreground)]/80">
                            <p className="font-medium text-[var(--foreground)]">{formData.name}</p>
                            <p>{formData.address}</p>
                            <p>
                              {[formData.city, formData.state, formData.pincode].filter(Boolean).join(", ")}
                            </p>
                            <p className="mt-2 text-xs text-[var(--foreground)]/50">
                               Currently using your primary address.
                            </p>
                          </div>
                      ) : (
                          <div className="text-sm text-[var(--foreground)]/60 italic">
                             No address provided yet.
                          </div>
                      )}
                  </div>

                   <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-red-400 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
               </div>
            </div>

            <div className="mt-12 pt-10 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div>
                   <h2 className="text-xl font-heading font-bold text-[var(--foreground)]">Saved Addresses</h2>
                   <p className="text-sm text-[var(--foreground)]/60 mt-1">Manage your alternative delivery locations</p>
                </div>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      showAddAddress 
                      ? "bg-red-50 text-red-600 hover:bg-red-100" 
                      : "bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20"
                  }`}
                >
                   {showAddAddress ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddAddress ? "Cancel" : "Add New Address"}</span>
                </button>
              </div>

              {showAddAddress && (
                  <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     className="mb-8 overflow-hidden"
                  >
                    <div className="p-6 md:p-8 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">New Address Details</h3>
                        <LocationDetector onLocationDetected={handleNewAddressLocationDetected} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Address</label>
                          <textarea
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white dark:bg-zinc-900 text-[var(--foreground)]"
                            rows={2}
                            placeholder="Street address..."
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
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAddress.isDefault}
                              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                              className="w-4 h-4 text-brand-purple rounded border-gray-300 focus:ring-brand-purple"
                            />
                            <span className="text-sm text-[var(--foreground)]">Set as default address</span>
                          </label>
                          
                          <button
                            onClick={handleAddAddress}
                            disabled={!newAddress.address || !newAddress.city || !newAddress.pincode}
                            className="w-full sm:w-auto px-8 py-3 bg-brand-purple text-white rounded-full font-medium hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-purple/20"
                          >
                            Save Address
                          </button>
                      </div>
                    </div>
                  </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(formData.addresses || []).map((addr, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border transition-all hover:shadow-md ${addr.isDefault ? "border-brand-purple bg-brand-purple/5" : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"} group`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-[var(--foreground)]">{addr.name || formData.name}</div>
                          <div className="text-xs text-[var(--foreground)]/60">{addr.mobile || formData.mobile}</div>
                        </div>
                        {addr.isDefault && (
                          <span className="px-2.5 py-1 bg-brand-purple text-white text-[10px] uppercase tracking-wider font-bold rounded-full">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground)]/80 mb-4 line-clamp-2 min-h-[2.5rem]">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      
                      <div className="flex items-center gap-3 text-sm pt-3 border-t border-gray-100 dark:border-zinc-800">
                        {!addr.isDefault && (
                          <button
                          onClick={() => handleSetDefault(idx)}
                          className="text-brand-purple hover:text-brand-purple/80 font-medium text-xs uppercase tracking-wide"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs uppercase tracking-wide ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                
                {(!formData.addresses || formData.addresses.length === 0) && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-[var(--foreground)]/40 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50">
                    <MapPin className="w-8 h-8 mb-2 opacity-50" />
                    <p>No additional addresses saved.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
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
    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple text-[color:var(--foreground)] transition-all ${
          disabled 
            ? "opacity-70 bg-gray-50 dark:bg-zinc-800/50 cursor-not-allowed" 
            : "bg-white dark:bg-zinc-900"
        } ${error ? "border-red-500" : "border-gray-200 dark:border-zinc-700"}`}
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
    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple text-[color:var(--foreground)] transition-all ${
        disabled 
          ? "opacity-70 bg-gray-50 dark:bg-zinc-800/50 cursor-not-allowed" 
          : "bg-white dark:bg-zinc-900"
      } ${error ? "border-red-500" : "border-gray-200 dark:border-zinc-700"}`}
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
    <label className="block text-sm font-medium text-[color:var(--foreground)] mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple text-[color:var(--foreground)] transition-all ${
        disabled 
          ? "opacity-70 bg-gray-50 dark:bg-zinc-800/50 cursor-not-allowed" 
          : "bg-white dark:bg-zinc-900"
      } border-gray-200 dark:border-zinc-700`}
    >
      <option value="">Select Gender</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

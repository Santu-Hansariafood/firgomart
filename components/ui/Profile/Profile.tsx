"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusBadgeClass = (s?: string) => {
    const t = String(s || "").toLowerCase();
    if (t === "pending") return "bg-yellow-100 text-yellow-800";
    if (["paid", "processing", "shipped"].includes(t)) return "bg-blue-100 text-blue-800";
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-red-600">
                  <span className="text-5xl font-black text-red-700 tracking-wider leading-none">{initials}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-blue-100 mt-1">
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
            <div className="mb-6 p-4 border rounded-lg bg-white border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-lg font-medium text-gray-900">{(formData.name || "").trim() || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="text-lg font-medium text-gray-900">{(formData.email || "").trim() || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Mobile</div>
                  <div className="text-lg font-medium text-gray-900">{(formData.mobile || "").trim() || "—"}</div>
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

            <div className="mt-6">
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-500 transition-all"
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
          className="bg-white rounded-2xl shadow-lg overflow-hidden mt-6"
        >
          <div className="p-8">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Previous Orders</h2>
            {loadingOrders ? (
              <div className="text-gray-600">Loading...</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-600">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">Order {o.orderNumber || o.id}</div>
                        <span className={`text-xs px-2 py-1 rounded ${statusBadgeClass(o.status)}`}>{String(o.status || "").toUpperCase()}</span>
                      </div>
                      <div className="text-sm text-gray-900 font-semibold">₹{Number(o.amount || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/api/orders/${encodeURIComponent(o.id)}/receipt`} className="px-3 py-1 border rounded">View Receipt</Link>
                      <Link href={`/api/orders/${encodeURIComponent(o.id)}/receipt?format=pdf&download=true`} className="px-3 py-1 border rounded">Download PDF</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

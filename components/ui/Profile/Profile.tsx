"use client";

import { useState, ChangeEvent } from "react";
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10" />
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
                  className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <InputField
                label="Full Name"
                name="name"
                icon={<User className="w-5 h-5 text-gray-400" />}
                value={formData.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
                error={errors.name}
              />

              {/* Email */}
              {formData.email && (
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
              )}

              {/* Mobile */}
              {formData.mobile && (
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
              )}

              {/* Date of Birth */}
              {formData.dateOfBirth && (
                <InputField
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  icon={<Calendar className="w-5 h-5 text-gray-400" />}
                  value={formData.dateOfBirth || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              )}

              {/* Gender */}
              {formData.gender && (
                <SelectField
                  label="Gender"
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              )}
            </div>

            {/* Address */}
            {formData.address && (
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
            )}

            {/* City / State / Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {formData.city && (
                <SimpleInput
                  label="City"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              )}
              {formData.state && (
                <SimpleInput
                  label="State"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              )}
              {formData.pincode && (
                <SimpleInput
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.pincode}
                />
              )}
            </div>

            {/* Save / Cancel */}
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

            {/* Logout */}
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
      </div>
    </div>
  );
};

export default Profile;

/* ---------- Helper Subcomponents ---------- */

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
      <option value="male">Male</option>
      <option value="female">Female</option>
      <option value="other">Other</option>
    </select>
  </div>
);

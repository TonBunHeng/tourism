import { useState, useRef, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Trash2,
  ChevronDown,
  AlertCircle,
  Lock,
  ShieldAlert,
  UserPlus,
  Shield,
  CheckCircle2,
  Plus,
  Check
} from "lucide-react";
import uploadService from "../../services/uploadService";
import { validateImageFile } from "../../utils/fileValidation";
import authService, { normalizeRole } from "../../services/authService";

export default function UserModal({
  isOpen,
  editingUser,
  userData,
  newUserData,
  onUserChange,
  onNewUserChange,
  onClose,
  onSubmit
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileValidationError, setFileValidationError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentUser = authService.getCurrentUser();
  const isSuperAdmin = normalizeRole(currentUser?.role) === 'super_admin';

  const data = editingUser ? userData : newUserData;
  const isEditingSuperAdmin = editingUser && normalizeRole(editingUser.role) === 'super_admin';
  const isBlockedFromEditing = isEditingSuperAdmin && !isSuperAdmin;

  const handleChange = (field, value) => {
    if (editingUser && onUserChange) {
      onUserChange({ ...data, [field]: value });
    } else if (onNewUserChange) {
      onNewUserChange({ ...data, [field]: value });
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileValidationError('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileValidationError(validation.error);
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("avatar", reader.result);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'avatars');
      if (res.success && res.data?.url) {
        handleChange("avatar", res.data.url);
      }
    } catch (err) {
      console.warn("Avatar backend upload fallback to data URI:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    handleChange("avatar", "");
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const availableRoles = [
    { value: "user", label: "User" },
    { value: "guide_editor", label: "Tourism Content Editor" },
    { value: "business_owner", label: "Business Owner" },
    { value: "admin", label: "Admin" },
    ...(isSuperAdmin ? [{ value: "super_admin", label: "Super Admin" }] : [])
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-alert-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[var(--color-white)] dark:bg-[var(--color-bg-dark)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-alert-popup"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)] bg-[var(--color-surface-hover-light)]/50 dark:bg-[var(--color-surface-hover-dark)]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#003E83]/10 dark:bg-blue-500/10 flex items-center justify-center text-[#003E83] dark:text-blue-400 shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">
                {editingUser ? "Edit User Account" : "Create New User Account"}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                {editingUser ? "Update system role, profile details and permissions." : "Add a new user with assigned system role."}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={onSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Super Admin Security Banner if unauthorized */}
          {isBlockedFromEditing && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold block mb-0.5">Super Admin Protected</span>
                Only Super Administrators can modify Super Admin accounts.
              </div>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-md bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] overflow-hidden shrink-0 flex items-center justify-center">
              {data.avatar ? (
                <img src={data.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)]" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                  disabled={isBlockedFromEditing}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isBlockedFromEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#003E83] hover:bg-[#002e62] text-white text-xs font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isUploading ? "Uploading..." : "Upload Photo"}
                </button>
                {data.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isBlockedFromEditing}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
                PNG, JPG, WEBP up to 5MB
              </p>
              {fileValidationError && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fileValidationError}
                </p>
              )}
            </div>
          </div>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Sophea Traveler"
                  value={data.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={data.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Phone Number & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="+855 12 345 678"
                  value={data.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Location / Province
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g., Phnom Penh"
                  value={data.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
              {editingUser ? "New Password (Leave blank to keep current)" : "Password *"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={editingUser ? "Enter new password if changing" : "Enter password (min. 6 characters)"}
                value={data.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={isBlockedFromEditing}
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] transition-all disabled:opacity-50"
                required={!editingUser}
                minLength={editingUser ? undefined : 6}
              />
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                System Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={normalizeRole(data.role) || "user"}
                  onChange={(e) => handleChange("role", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md pl-9 pr-9 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] cursor-pointer disabled:opacity-50"
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mb-1.5">
                Account Status *
              </label>
              <div className="relative">
                <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={data.status || "Active"}
                  onChange={(e) => handleChange("status", e.target.value)}
                  disabled={isBlockedFromEditing}
                  className="appearance-none w-full bg-[var(--color-bg-light)] dark:bg-[var(--color-input-dark-bg)] border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)]/70 rounded-md pl-9 pr-9 py-2.5 text-sm text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-input)] cursor-pointer disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-subtle-light)] dark:border-[var(--color-modal-border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-[var(--color-border-subtle-light)] dark:border-[var(--color-border-dark)] text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:bg-[var(--color-surface-hover-light)] dark:hover:bg-[var(--color-surface-hover-dark)] font-medium text-sm transition-colors text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || isBlockedFromEditing}
              className="flex-1 py-2.5 px-4 rounded-md bg-[#003E83] hover:bg-[#002e62] active:scale-[0.98] text-white font-medium text-sm transition-all text-center cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
            >
              {isUploading ? (
                "Uploading..."
              ) : editingUser ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

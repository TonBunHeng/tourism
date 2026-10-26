import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function ProfileHeader({
  userData,
  profileImage,
  fileInputRef,
  handleImageUpload,
  onDeleteImage,
  setIsEditing
}) {
  const formatRole = (role) => {
    if (!role) return 'User';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      <div className="flex items-start gap-4 sm:gap-6 w-full sm:w-auto">
        <div className="relative flex-shrink-0 group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md bg-[#181c24] dark:bg-[#181c24] border-2 border-white dark:border-zinc-800 flex items-center justify-center overflow-hidden shadow-md relative">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200" />
            )}

            {/* Clean hover overlay with quick actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
              {fileInputRef && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md transition-colors cursor-pointer"
                  title="Change photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
              {profileImage && onDeleteImage && (
                <button
                  type="button"
                  onClick={onDeleteImage}
                  className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Floating Camera Button with ring outline */}
          {fileInputRef && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 bg-[#003E83] hover:bg-[#002e62] text-white rounded-md shadow-md ring-2 ring-[var(--color-white)] dark:ring-zinc-900 transition-transform active:scale-95 cursor-pointer z-10"
                title="Change & crop profile picture"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="hidden"
              />
            </>
          )}
        </div>
        {/* Name/badges shown next to avatar on mobile so the header reads naturally at narrow widths */}
        <div className="flex-1 min-w-0 sm:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)] truncate">{userData.name || 'User'}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {userData.verified && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] rounded-md border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)]">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
            <span className="text-xs px-2 py-0.5 bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)] text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] rounded-md border border-[var(--color-purple-badge-border)] dark:border-[var(--color-purple-badge-dark-border)] font-medium">
              {formatRole(userData.role)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0 w-full">
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary-light)] dark:text-[var(--color-white)]">{userData.name || 'User'}</h2>
          {userData.verified && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 bg-[var(--color-info-bg)] dark:bg-[var(--color-info-dark-bg)] text-[var(--color-info-text)] dark:text-[var(--color-info-dark-text)] rounded-md border border-[var(--color-info-border)] dark:border-[var(--color-info-dark-border)] font-medium">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
          <span className="text-xs px-2.5 py-0.5 bg-[var(--color-purple-badge-bg)] dark:bg-[var(--color-purple-badge-dark-bg)] text-[var(--color-purple-badge-text)] dark:text-[var(--color-purple-badge-dark-text)] rounded-md border border-[var(--color-purple-badge-border)] dark:border-[var(--color-purple-badge-dark-border)] font-medium">
            {formatRole(userData.role)}
          </span>
        </div>

        <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] mt-2">
          {userData.bio}
        </p>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)]">
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" />
            {userData.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-gray-400" />
            {userData.phone}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {userData.location}
          </span>
          {userData.joinDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {userData.joinDate}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 text-xs md:text-sm font-medium rounded-md bg-[#003E83] hover:bg-[#002e62] text-white transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
      >
        <Edit className="w-4 h-4 shrink-0" />
        <span>Edit Profile</span>
      </button>
    </div>
  );
}

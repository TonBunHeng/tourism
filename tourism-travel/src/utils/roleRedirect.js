/**
 * Utility to determine the role-specific landing path after login or authorization checks.
 *
 * @param {Object} user User object containing role information
 * @param {string|null} fallback Optional custom fallback path
 * @returns {string} Target URL path
 */
export function getRoleRedirectPath(user, fallback = null) {
  if (!user) return '/';
  const rawRole = user.role || 'user';
  const normRole = String(rawRole).toLowerCase().trim().replace(/[\s/-]+/g, '_');

  // Business Owner Role -> Management Dashboard
  if (normRole === 'business_owner' || normRole === 'business') {
    return '/business/dashboard';
  }

  // Tour Guide & Content Editor Roles -> Guide Portal
  if (['tour_guide', 'guide_editor', 'content_editor', 'guide'].includes(normRole)) {
    return '/guide/dashboard';
  }

  // Admin / Super Admin / Management Roles -> General Dashboard
  if (['admin', 'super_admin', 'superadmin', 'administrator', 'manager', 'staff'].includes(normRole)) {
    return '/dashboard';
  }

  // Public Tourist / Travel User Role -> Travel User Workspace
  if (fallback && fallback !== '/login') {
    return fallback;
  }
  return '/travel-user';
}

export default getRoleRedirectPath;

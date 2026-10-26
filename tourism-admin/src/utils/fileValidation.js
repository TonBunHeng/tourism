/**
 * File Upload Security & Validation Utility
 * 
 * Provides client-side restrictions on file types, extensions, and file sizes.
 * Prevents obviously dangerous file formats (executables, scripts, HTML, SVG XSS)
 * from being uploaded through the frontend UI.
 * 
 * IMPORTANT: Client-side validation improves user experience and security posture,
 * but the backend API must independently validate all file uploads.
 */

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
];

export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.php', '.phtml',
  '.js', '.mjs', '.ts', '.html', '.htm', '.xhtml', '.svg',
  '.dll', '.scr', '.vbs', '.py', '.rb', '.jar'
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validate an image file before upload or processing.
 * @param {File} file 
 * @param {object} options 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, options = {}) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const maxSize = options.maxSize || MAX_IMAGE_SIZE_BYTES;
  const fileName = file.name || '';
  const lastDotIndex = fileName.lastIndexOf('.');
  const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : '';

  // 1. Check dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File type "${ext}" is not permitted for security reasons. Please select a valid image file.`,
    };
  }

  // 2. Validate allowed image extensions
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Allowed formats are: JPG, JPEG, PNG, WEBP, GIF.`,
    };
  }

  // 3. Validate MIME type
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid image format (${file.type}). Allowed formats: JPG, PNG, WEBP, GIF.`,
    };
  }

  // 4. Validate file size
  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

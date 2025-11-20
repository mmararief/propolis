/**
 * Get full URL for product image
 * @param {string|string[]|null|undefined} imagePath - Image path from backend (e.g., "/storage/products/filename.png") or array of paths
 * @returns {string|null} Full URL to the image or null
 */
export const getProductImageUrl = (imagePath) => {
  // Handle array - get first image
  if (Array.isArray(imagePath)) {
    if (imagePath.length === 0) {
      return null;
    }
    imagePath = imagePath[0];
  }

  if (!imagePath) {
    return null; // Return null so we can show placeholder
  }

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get base URL (remove /api from API URL)
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
  const baseUrl = apiUrl.replace('/api', '');

  // Ensure path starts with /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${path}`;
};


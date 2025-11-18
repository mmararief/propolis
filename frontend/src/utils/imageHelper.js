/**
 * Get full URL for product image
 * @param {string|null|undefined} imagePath - Image path from backend (e.g., "/storage/products/filename.png")
 * @returns {string} Full URL to the image or placeholder
 */
export const getProductImageUrl = (imagePath) => {
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


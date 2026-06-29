// src/lib/cloudinaryUrl.ts

/**
 * Inserta una transformación de Cloudinary en una URL ya existente.
 * Ejemplo:
 *   https://res.cloudinary.com/cloud/image/upload/v123/folder/img.jpg
 *   → https://res.cloudinary.com/cloud/image/upload/c_fill,g_auto,w_800,h_800,f_auto,q_auto/v123/folder/img.jpg
 */
export function withCloudinaryTransform(
  url: string,
  transform = 'c_fill,g_auto,w_800,h_800,f_auto,q_auto'
): string {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}

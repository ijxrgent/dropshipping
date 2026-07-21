import { useState } from 'react'
import { ImageItem } from './types'

export function useImageUpload(initialImages: ImageItem[] = []) {
  const [images, setImages] = useState<ImageItem[]>(initialImages)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )
    formData.append('folder', 'modaguajira/products')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) throw new Error('Error al subir a Cloudinary')
    const data = await res.json()
    return data.secure_url
  }

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files) return
    const fileArray = Array.from(files)

    if (images.length + fileArray.length > 6) {
      setError('Máximo 6 imágenes por producto')
      return
    }

    setUploadingImages(true)
    setError(null)

    try {
      const uploaded = await Promise.all(fileArray.map(uploadToCloudinary))
      setImages((prev) => [
        ...prev,
        ...uploaded.map((url) => ({
          id: crypto.randomUUID(),
          url,
          isNew: true,
        })),
      ])
    } catch {
      setError('Error al subir una o más imágenes')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  return {
    images,
    uploadingImages,
    error,
    setError,
    handleFilesSelected,
    removeImage,
  }
}

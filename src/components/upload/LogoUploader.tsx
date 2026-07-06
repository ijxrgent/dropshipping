'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Store, Upload, Loader2 } from 'lucide-react'
import type { Area } from 'react-easy-crop'
import CropModal from './CropModal'
import { getCroppedImageBlob } from '@/lib/cropImage'

interface LogoUploaderProps {
  initialLogoUrl?: string | null
  onUploaded: (url: string) => void
}

export default function LogoUploader({
  initialLogoUrl,
  onUploaded,
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null) // imagen recién seleccionada, sin recortar
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialLogoUrl ?? null
  )
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen no debe superar 8MB')
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = () => setRawImageSrc(reader.result as string)
    reader.readAsDataURL(file)

    // Limpiar el input para poder seleccionar el mismo archivo otra vez si se cancela
    e.target.value = ''
  }

  async function handleCropConfirm(cropArea: Area) {
    if (!rawImageSrc) return
    setRawImageSrc(null) // cierra el modal
    setUploading(true)
    setError(null)

    try {
      const blob = await getCroppedImageBlob(rawImageSrc, cropArea)
      const url = await uploadToCloudinary(blob)
      setPreviewUrl(url)
      onUploaded(url)
    } catch (err) {
      console.error(err)
      setError('No se pudo subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  async function uploadToCloudinary(blob: Blob): Promise<string> {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )
    formData.append('folder', 'riohachamarket/logos')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) throw new Error('Error al subir a Cloudinary')

    const data = await res.json()
    return data.secure_url as string
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        {/* Preview circular */}
        <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {uploading ? (
            <Loader2 size={22} className="text-gray-400 animate-spin" />
          ) : previewUrl ? (
            <Image
              src={previewUrl}
              alt="Logo de la tienda"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <Store size={26} className="text-gray-400" />
          )}
        </div>

        {/* Botón de selección */}
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Upload size={14} />
            {previewUrl ? 'Cambiar logo' : 'Subir logo'}
          </button>
          <p className="text-xs text-gray-400 mt-1.5">PNG o JPG, máximo 8MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {/* Modal de recorte */}
      {rawImageSrc && (
        <CropModal
          imageSrc={rawImageSrc}
          onCancel={() => setRawImageSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}

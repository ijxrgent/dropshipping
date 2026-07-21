import { useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { ImageItem } from './types'

interface ImageUploaderProps {
  images: ImageItem[]
  uploadingImages: boolean
  onFilesSelected: (files: FileList | null) => void
  onRemoveImage: (id: string) => void
}

export function ImageUploader({
  images,
  uploadingImages,
  onFilesSelected,
  onRemoveImage,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fotos <span className="text-gray-400 font-normal">(hasta 6)</span>
      </label>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
          >
            <Image src={img.url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onRemoveImage(img.id)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={11} className="text-white" />
            </button>
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {uploadingImages ? (
              <Loader2 size={16} className="text-gray-400 animate-spin" />
            ) : (
              <ImagePlus size={16} className="text-gray-400" />
            )}
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFilesSelected(e.target.files)}
        className="hidden"
      />
    </div>
  )
}

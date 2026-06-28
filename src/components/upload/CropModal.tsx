'use client'

import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { X, ZoomIn, Check } from 'lucide-react'

interface CropModalProps {
  imageSrc: string
  onCancel: () => void
  onConfirm: (cropArea: Area) => void
}

export default function CropModal({
  imageSrc,
  onCancel,
  onConfirm,
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  function handleConfirm() {
    if (croppedAreaPixels) {
      onConfirm(croppedAreaPixels)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">
            Ajusta tu logo
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cancelar"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Área de recorte */}
        <div className="relative w-full h-72 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Control de zoom */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <ZoomIn size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-600"
            aria-label="Zoom"
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-3 px-5 py-4">
          <button
            onClick={onCancel}
            className="flex-1 h-10 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check size={15} /> Usar foto
          </button>
        </div>
      </div>
    </div>
  )
}

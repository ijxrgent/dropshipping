'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

interface ProductGalleryProps {
  images: { url: string }[]
  productName: string
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center">
        <Package size={40} className="text-gray-300" />
      </div>
    )
  }

  return (
    <div>
      {/* Imagen principal */}
      <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withCloudinaryTransform(
            images[activeIndex].url,
            'c_fill,g_auto,w_800,h_800,f_auto,q_auto'
          )}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                i === activeIndex ? 'border-teal-500' : 'border-transparent'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withCloudinaryTransform(
                  img.url,
                  'c_fill,g_auto,w_120,h_120,f_auto,q_auto'
                )}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

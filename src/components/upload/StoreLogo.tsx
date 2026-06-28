'use client'

import { CldImage } from 'next-cloudinary'
import { Store } from 'lucide-react'

interface StoreLogoProps {
  logoUrl: string | null
  storeName: string
  size?: number
}

export default function StoreLogo({
  logoUrl,
  storeName,
  size = 56,
}: StoreLogoProps) {
  if (!logoUrl) {
    return (
      <div
        className="rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Store size={size * 0.43} className="text-teal-600" />
      </div>
    )
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden flex-shrink-0 bg-gray-100"
      style={{ width: size, height: size }}
    >
      <CldImage
        src={logoUrl}
        alt={storeName}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  )
}

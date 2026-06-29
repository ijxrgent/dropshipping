import Link from 'next/link'
import { Store } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

export interface FeaturedShop {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

interface ShopsGridProps {
  shops: FeaturedShop[]
}

export default function ShopsGrid({ shops }: ShopsGridProps) {
  if (shops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 py-12 text-center">
        <Store size={28} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Aún no hay tiendas activas</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {shops.map((shop) => (
        <Link
          key={shop.id}
          href={`/tienda/${shop.slug}`}
          className="flex flex-col items-center gap-3 bg-white border border-gray-200 rounded-xl py-6 px-3 hover:shadow-md hover:border-[#1B6E73]/40 transition-all text-center"
        >
          <div className="relative w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {shop.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={withCloudinaryTransform(
                  shop.logoUrl,
                  'c_fill,g_auto,w_160,h_160,f_auto,q_auto'
                )}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store size={22} className="text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 truncate w-full">
            {shop.name}
          </p>
        </Link>
      ))}
    </div>
  )
}

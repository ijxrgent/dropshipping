import Link from 'next/link'
import { Store } from 'lucide-react'
import { withCloudinaryTransform } from '@/lib/cloudinaryUrl'

export interface FeaturedShop {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

export default function ShopsGrid({ shops }: { shops: FeaturedShop[] }) {
  if (shops.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 py-10 text-center">
        <Store size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">Aún no hay tiendas activas</p>
      </div>
    )
  }

  return (
    // 2 columnas en móvil, 4 en sm+
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {shops.map((shop) => (
        <Link
          key={shop.id}
          href={`/shop/${shop.slug}`}
          className="flex flex-col items-center gap-2 bg-white border border-gray-200 rounded-xl py-4 px-2 text-center hover:shadow-md transition-shadow"
        >
          <div
            className="rounded-full bg-gray-100 overflow-hidden flex-shrink-0"
            style={{ width: '56px', height: '56px' }}
          >
            {shop.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={withCloudinaryTransform(
                  shop.logoUrl,
                  'c_fill,g_auto,w_112,h_112,f_auto,q_auto'
                )}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store size={20} className="text-gray-400" />
              </div>
            )}
          </div>
          <p className="text-xs font-medium text-gray-800 truncate w-full">
            {shop.name}
          </p>
        </Link>
      ))}
    </div>
  )
}

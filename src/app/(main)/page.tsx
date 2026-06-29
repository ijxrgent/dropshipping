import { prisma } from '@/lib/prisma'
import HeroSlider from '@/components/home/HeroSlider'
import ProductCarousel from '@/components/home/ProductCarousel'
import ShopsGrid from '@/components/home/ShopsGrid'

export default async function HomePage() {
  const [products, shops] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, store: { isActive: true } },
      take: 12,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } },
        store: { select: { name: true, slug: true } },
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, logoUrl: true },
    }),
  ])

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-10">
      {/* Hero / slider */}
      <HeroSlider />

      {/* Productos destacados */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recién publicados</h2>
          <p className="text-xs text-gray-400">Lo más nuevo del marketplace</p>
        </div>
        <ProductCarousel products={products} />
      </section>

      {/* Tiendas destacadas */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Tiendas en ModaGuajira
          </h2>
          <p className="text-xs text-gray-400">
            Vendedores activos en la plataforma
          </p>
        </div>
        <ShopsGrid shops={shops} />
      </section>
    </main>
  )
}

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
        originalPrice: true,
        discount: true,
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
    <main className="w-full">
      {/* Hero: sin padding lateral, ocupa todo el ancho */}
      <HeroSlider />

      {/* Resto del contenido: con padding lateral */}
      <div className="max-w-7xl mx-auto px-4 pb-24 sm:pb-8">
        {/* Productos */}
        <section className="mt-6">
          <ProductCarousel products={products} />
        </section>

        {/* Tiendas */}
        <section className="mt-8 mb-4">
          <p
            className="font-bold text-gray-900 mb-3"
            style={{ fontSize: '15px' }}
          >
            Tiendas en Riohacha Market
          </p>
          <ShopsGrid shops={shops} />
        </section>
      </div>
    </main>
  )
}

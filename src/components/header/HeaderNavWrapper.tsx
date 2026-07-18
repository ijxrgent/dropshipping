import { prisma } from '@/lib/prisma'
import HeaderNav from './HeaderNav'

export default async function HeaderNavWrapper() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { name: true, slug: true },
  })

  return <HeaderNav categories={categories} />
}

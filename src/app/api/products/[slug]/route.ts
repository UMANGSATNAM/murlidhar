import { NextRequest } from 'next/server'
import { fetchProductBySlug } from '@/lib/api-helpers'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product || !product.active) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }
  const related = await db.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
  })
  return Response.json({ product, related })
}

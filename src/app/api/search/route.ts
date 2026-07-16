import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/search?q=xxx — quick search for autocomplete (top 8 matches)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  if (q.length < 2) return Response.json({ items: [], categories: [] })

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        active: true,
        OR: [
          { name: { contains: q } },
          { shortDesc: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: { select: { name: true } },
      },
    }),
    db.category.findMany({
      where: {
        active: true,
        OR: [{ name: { contains: q } }, { description: { contains: q } }],
      },
      take: 4,
      select: { id: true, name: true, slug: true, icon: true },
    }),
  ])

  return Response.json({
    items: products,
    categories,
  })
}

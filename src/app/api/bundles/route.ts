import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/bundles — public list of active bundles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const featured = searchParams.get('featured')

  const where: any = { active: true }
  if (featured === 'true') where.featured = true

  const bundles = await db.productBundle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, basePrice: true,
              images: { orderBy: { order: 'asc' }, take: 1 },
            },
          },
        },
      },
    },
  })

  return Response.json({ items: bundles })
}

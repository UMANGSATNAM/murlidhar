import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Admin — list all reviews (with optional product filter)
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'pending' | 'approved' | 'all'
  const q = searchParams.get('q') || ''

  const where: any = {}
  if (status === 'pending') where.active = false
  else if (status === 'approved') where.active = true
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { comment: { contains: q } },
      { title: { contains: q } },
    ]
  }

  const reviews = await db.productReview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, slug: true } } },
  })

  return Response.json({ items: reviews })
}

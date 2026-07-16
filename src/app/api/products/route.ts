import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''
  const search = searchParams.get('q') || ''
  const minPrice = parseFloat(searchParams.get('minPrice') || '0')
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '0')
  const featured = searchParams.get('featured')
  const sort = searchParams.get('sort') || 'newest'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(48, Math.max(1, parseInt(searchParams.get('pageSize') || '12', 10)))

  const where: any = { active: true }
  if (category) {
    where.category = { slug: category }
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { shortDesc: { contains: search } },
      { description: { contains: search } },
    ]
  }
  if (featured === 'true') where.featured = true
  if (minPrice || maxPrice) {
    where.basePrice = {}
    if (minPrice) where.basePrice.gte = minPrice
    if (maxPrice) where.basePrice.lte = maxPrice
  }

  const orderBy: any =
    sort === 'price-asc'
      ? { basePrice: 'asc' }
      : sort === 'price-desc'
      ? { basePrice: 'desc' }
      : sort === 'name'
      ? { name: 'asc' }
      : { createdAt: 'desc' }

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    }),
  ])

  return Response.json({
    items: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const bundles = await db.productBundle.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, basePrice: true } },
        },
      },
      _count: { select: { items: true } },
    },
  })
  return Response.json({ items: bundles })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { name, description, bundlePrice, active, featured, items } = body
  if (!name || !items?.length) {
    return Response.json({ error: 'Name and at least 1 item required' }, { status: 400 })
  }

  // Fetch product prices to calculate original price
  const productIds = items.map((i: any) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, basePrice: true },
  })
  const originalPrice = items.reduce((s: number, i: any) => {
    const p = products.find((pr) => pr.id === i.productId)
    return s + (p?.basePrice || 0) * (i.qty || 1)
  }, 0)
  const savings = Math.max(0, originalPrice - parseFloat(bundlePrice || 0))

  const slug = slugify(name) + '-' + Date.now().toString(36)

  const bundle = await db.productBundle.create({
    data: {
      name,
      slug,
      description,
      originalPrice,
      bundlePrice: parseFloat(bundlePrice) || 0,
      savings,
      active: active ?? true,
      featured: featured ?? false,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          qty: i.qty || 1,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  })

  return Response.json({ ok: true, bundle })
}

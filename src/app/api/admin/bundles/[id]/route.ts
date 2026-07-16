import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { id, name, description, bundlePrice, active, featured, items } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const existing = await db.productBundle.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  // If items changed, recalculate original price
  let originalPrice = existing.originalPrice
  let savings = existing.savings
  if (items) {
    const productIds = items.map((i: any) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, basePrice: true },
    })
    originalPrice = items.reduce((s: number, i: any) => {
      const p = products.find((pr) => pr.id === i.productId)
      return s + (p?.basePrice || 0) * (i.qty || 1)
    }, 0)
    const newBundlePrice = bundlePrice !== undefined ? parseFloat(bundlePrice) : existing.bundlePrice
    savings = Math.max(0, originalPrice - newBundlePrice)

    // Replace items
    await db.bundleItem.deleteMany({ where: { bundleId: id } })
    await db.bundleItem.createMany({
      data: items.map((i: any) => ({
        bundleId: id,
        productId: i.productId,
        qty: i.qty || 1,
      })),
    })
  }

  const updated = await db.productBundle.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      description: description ?? existing.description,
      bundlePrice: bundlePrice !== undefined ? parseFloat(bundlePrice) : existing.bundlePrice,
      originalPrice,
      savings,
      active: active ?? existing.active,
      featured: featured ?? existing.featured,
    },
  })

  return Response.json({ ok: true, bundle: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  await db.productBundle.delete({ where: { id } })
  return Response.json({ ok: true })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const tiers = await db.bulkDiscountTier.findMany({ orderBy: { minQty: 'asc' } })
  return Response.json({ items: tiers })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { minQty, discountPct, active } = body
  if (!minQty || !discountPct) return Response.json({ error: 'minQty and discountPct required' }, { status: 400 })
  const tier = await db.bulkDiscountTier.create({
    data: { minQty: parseInt(minQty), discountPct: parseFloat(discountPct), active: active ?? true },
  })
  return Response.json({ ok: true, tier })
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { id, minQty, discountPct, active } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const updated = await db.bulkDiscountTier.update({
    where: { id },
    data: {
      minQty: minQty !== undefined ? parseInt(minQty) : undefined,
      discountPct: discountPct !== undefined ? parseFloat(discountPct) : undefined,
      active: active !== undefined ? active : undefined,
    },
  })
  return Response.json({ ok: true, tier: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await db.bulkDiscountTier.delete({ where: { id } })
  return Response.json({ ok: true })
}

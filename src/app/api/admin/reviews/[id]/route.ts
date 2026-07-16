import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Approve / disapprove / delete a review
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { id, active } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const updated = await db.productReview.update({
    where: { id },
    data: { active: active === true || active === false ? active : undefined },
  })

  // Recompute product aggregate rating when review is approved/unapproved
  const reviews = await db.productReview.findMany({
    where: { productId: updated.productId, active: true },
  })
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  await db.product.update({
    where: { id: updated.productId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
  })

  return Response.json({ ok: true, review: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const existing = await db.productReview.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  await db.productReview.delete({ where: { id } })

  // Recompute product aggregate
  const reviews = await db.productReview.findMany({
    where: { productId: existing.productId, active: true },
  })
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  await db.product.update({
    where: { id: existing.productId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
  })

  return Response.json({ ok: true })
}

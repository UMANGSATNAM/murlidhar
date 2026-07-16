import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { id, name, location, rating, text, avatar, active } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const existing = await db.testimonial.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await db.testimonial.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      location: location ?? existing.location,
      rating: rating ?? existing.rating,
      text: text ?? existing.text,
      avatar: avatar ?? existing.avatar,
      active: active ?? existing.active,
    },
  })
  return Response.json({ ok: true, testimonial: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await db.testimonial.delete({ where: { id } })
  return Response.json({ ok: true })
}

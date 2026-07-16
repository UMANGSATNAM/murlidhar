import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { id, title, subtitle, imageUrl, link, position, order, active } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const existing = await db.banner.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await db.banner.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      subtitle: subtitle ?? existing.subtitle,
      imageUrl: imageUrl ?? existing.imageUrl,
      link: link ?? existing.link,
      position: position ?? existing.position,
      order: order ?? existing.order,
      active: active ?? existing.active,
    },
  })
  return Response.json({ ok: true, banner: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await db.banner.delete({ where: { id } })
  return Response.json({ ok: true })
}

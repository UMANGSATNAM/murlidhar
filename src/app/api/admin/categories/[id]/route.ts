import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { id, name, slug, description, image, icon, order, active } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const existing = await db.category.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await db.category.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug: slug ? slugify(slug) : existing.slug,
      description: description ?? existing.description,
      image: image ?? existing.image,
      icon: icon ?? existing.icon,
      order: order ?? existing.order,
      active: active ?? existing.active,
    },
  })
  return Response.json({ ok: true, category: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  // Block delete if products exist
  const count = await db.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return Response.json({ error: `Cannot delete: ${count} products still in this category. Move or delete them first.` }, { status: 400 })
  }
  await db.category.delete({ where: { id } })
  return Response.json({ ok: true })
}

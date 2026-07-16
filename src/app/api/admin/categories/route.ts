import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const items = await db.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { name, slug, description, image, icon, order, active } = body
  if (!name) return Response.json({ error: 'name required' }, { status: 400 })
  const finalSlug = slug ? slugify(slug) : slugify(name)
  const cat = await db.category.create({
    data: { name, slug: finalSlug, description, image, icon, order: order ?? 0, active: active ?? true },
  })
  return Response.json({ ok: true, category: cat })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const items = await db.banner.findMany({ orderBy: [{ position: 'asc' }, { order: 'asc' }] })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { title, subtitle, imageUrl, link, position, order, active } = body
  if (!imageUrl) return Response.json({ error: 'imageUrl required' }, { status: 400 })
  const banner = await db.banner.create({
    data: { title, subtitle, imageUrl, link, position: position || 'hero', order: order ?? 0, active: active ?? true },
  })
  return Response.json({ ok: true, banner })
}

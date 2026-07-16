import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const items = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { name, location, rating, text, avatar, active } = body
  if (!name || !text) return Response.json({ error: 'name & text required' }, { status: 400 })
  const t = await db.testimonial.create({
    data: { name, location, rating: rating ?? 5, text, avatar, active: active ?? true },
  })
  return Response.json({ ok: true, testimonial: t })
}

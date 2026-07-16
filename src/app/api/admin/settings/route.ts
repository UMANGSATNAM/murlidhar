import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  return Response.json(settings)
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  // upsert to be safe
  const existing = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!existing) {
    const created = await db.siteSettings.create({ data: { id: 'default', ...body } })
    return Response.json({ ok: true, settings: created })
  }
  const updated = await db.siteSettings.update({
    where: { id: 'default' },
    data: body,
  })
  return Response.json({ ok: true, settings: updated })
}

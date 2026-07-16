import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  const where: any = {}
  if (q) where.email = { contains: q.toLowerCase() }

  const [total, subscribers] = await Promise.all([
    db.newsletterSubscriber.count({ where: { active: true } }),
    db.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  return Response.json({ items: subscribers, totalActive: total })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  await db.newsletterSubscriber.delete({ where: { id } })
  return Response.json({ ok: true })
}

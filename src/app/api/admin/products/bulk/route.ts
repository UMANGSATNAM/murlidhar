import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { action, ids, data } = body

  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: 'No product IDs provided' }, { status: 400 })
  }

  try {
    if (action === 'delete') {
      await db.product.deleteMany({
        where: { id: { in: ids } }
      })
      return Response.json({ ok: true, message: `Deleted ${ids.length} products` })
    }
    
    if (action === 'status') {
      await db.product.updateMany({
        where: { id: { in: ids } },
        data: { active: data.active }
      })
      return Response.json({ ok: true, message: `Updated ${ids.length} products` })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

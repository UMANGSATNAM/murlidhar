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
    return Response.json({ error: 'No order IDs provided' }, { status: 400 })
  }

  try {
    if (action === 'delete') {
      await db.order.deleteMany({
        where: { id: { in: ids } }
      })
      return Response.json({ ok: true, message: `Deleted ${ids.length} orders` })
    }
    
    if (action === 'status') {
      const updateData: any = {}
      if (data.orderStatus) updateData.orderStatus = data.orderStatus
      if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus

      if (Object.keys(updateData).length > 0) {
        await db.order.updateMany({
          where: { id: { in: ids } },
          data: updateData
        })
      }
      return Response.json({ ok: true, message: `Updated ${ids.length} orders` })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

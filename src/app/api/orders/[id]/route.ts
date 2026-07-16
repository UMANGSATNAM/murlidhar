import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { sendEmail, statusUpdateHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET /api/orders/{id}?by=orderNumber  → public track by order number (no auth)
// GET /api/orders/{id}                 → admin fetch by order id (auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const byOrderNumber = searchParams.get('by') === 'orderNumber'

  if (byOrderNumber) {
    // Public lookup by order number
    const order = await db.order.findFirst({
      where: { orderNumber: id },
      include: { items: true, files: true },
    })
    if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ order })
  }

  // Admin fetch by order id
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, files: true },
  })
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ order })
}

// Admin — update order status (sends email)
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { id, orderStatus, paymentStatus, paymentRef, statusNote, internalNotes } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const existing = await db.order.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Order not found' }, { status: 404 })

  const data: any = {}
  if (orderStatus) data.orderStatus = orderStatus
  if (paymentStatus) data.paymentStatus = paymentStatus
  if (paymentRef !== undefined) data.paymentRef = paymentRef
  if (statusNote !== undefined) data.statusNote = statusNote
  if (internalNotes !== undefined) data.internalNotes = internalNotes

  // When order is marked 'delivered', award loyalty points (1 pt per ₹10)
  // Only award once (check if points already awarded)
  if (orderStatus === 'delivered' && existing.orderStatus !== 'delivered' && existing.loyaltyPoints === 0) {
    const pointsToAward = Math.floor(existing.total / 10)
    if (pointsToAward > 0) {
      data.loyaltyPoints = pointsToAward
      // Upsert loyalty account by phone
      await db.loyaltyAccount.upsert({
        where: { phone: existing.phone },
        create: {
          phone: existing.phone,
          name: existing.customerName,
          email: existing.email,
          points: pointsToAward,
          totalEarned: pointsToAward,
        },
        update: {
          name: existing.customerName,
          email: existing.email || undefined,
          points: { increment: pointsToAward },
          totalEarned: { increment: pointsToAward },
        },
      })
    }
  }

  const updated = await db.order.update({ where: { id }, data, include: { items: true } })

  // Send status update email if order status changed and customer email exists
  if (orderStatus && orderStatus !== existing.orderStatus && existing.email) {
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    if (settings?.email) {
      const html = statusUpdateHtml({
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        status: orderStatus,
        note: statusNote,
        business: settings.businessName,
      })
      await sendEmail({
        to: existing.email,
        subject: `Order ${updated.orderNumber} — Status: ${orderStatus}`,
        html,
      })
    }
  }

  return Response.json({ ok: true, order: updated })
}

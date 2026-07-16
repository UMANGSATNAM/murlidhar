import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// GET /api/admin/orders/export?status=&payment=&q=&from=&to=
// Returns a CSV file of all matching orders
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const payment = searchParams.get('payment') || ''
  const q = searchParams.get('q') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  const where: any = {}
  if (status) where.orderStatus = status
  if (payment) where.paymentStatus = payment
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ]
  }
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1) // include the full "to" day
      where.createdAt.lte = toDate
    }
  }

  const orders = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: { select: { productName: true, variantInfo: true, qty: true, unitPrice: true, total: true } },
      _count: { select: { files: true } },
    },
    take: 1000,
  })

  // Build CSV
  const headers = [
    'Order Number', 'Date', 'Customer Name', 'Phone', 'Email',
    'Address', 'City', 'State', 'Pincode',
    'Items', 'Subtotal', 'Shipping', 'Total',
    'Payment Method', 'Payment Status', 'Order Status',
    'Loyalty Points', 'Files Count', 'Remarks', 'Internal Notes',
  ]

  const escape = (val: any) => {
    if (val === null || val === undefined) return '""'
    const s = String(val).replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '')
    return `"${s}"`
  }

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.productName}${i.variantInfo ? ` (${i.variantInfo})` : ''} x${i.qty} @₹${i.unitPrice}`).join(' | ')
    return [
      escape(o.orderNumber),
      escape(new Date(o.createdAt).toLocaleString('en-IN')),
      escape(o.customerName),
      escape(o.phone),
      escape(o.email || ''),
      escape(o.address || ''),
      escape(o.city || ''),
      escape(o.state || ''),
      escape(o.pincode || ''),
      escape(itemsSummary),
      escape(o.subtotal),
      escape(o.shipping),
      escape(o.total),
      escape(o.paymentMethod),
      escape(o.paymentStatus),
      escape(o.orderStatus),
      escape(o.loyaltyPoints || 0),
      escape(o._count.files),
      escape(o.remarks || ''),
      escape(o.internalNotes || ''),
    ].join(',')
  })

  const csv = [headers.map(escape).join(','), ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

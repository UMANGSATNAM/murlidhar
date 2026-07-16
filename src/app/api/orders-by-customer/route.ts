import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/orders-by-customer?phone=xxx
// Public lookup — returns all orders matching the given phone number.
// No auth required (customers look up their own orders by phone).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = (searchParams.get('phone') || '').trim()
  const email = (searchParams.get('email') || '').trim().toLowerCase()

  if (!phone && !email) {
    return Response.json({ error: 'Phone or email required' }, { status: 400 })
  }

  const normalizePhone = (p: string) => p.replace(/\D/g, '')

  // Fetch all orders (limited set) and filter in JS — SQLite contains is literal
  // and won't match "8849866193" against " 884 986 6193" in DB.
  const allOrders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true, orderNumber: true, customerName: true, phone: true, email: true,
      total: true, orderStatus: true, paymentStatus: true, paymentMethod: true,
      createdAt: true,
      _count: { select: { items: true, files: true } },
    },
  })

  const targetPhone = phone ? normalizePhone(phone) : ''
  const targetEmail = email || ''

  const filtered = allOrders.filter((o) => {
    if (targetPhone) {
      const dbPhone = normalizePhone(o.phone || '')
      if (dbPhone.includes(targetPhone) || targetPhone.includes(dbPhone)) return true
      // Also try last 7 digits match
      if (dbPhone.length >= 7 && targetPhone.length >= 7) {
        const dbLast7 = dbPhone.slice(-7)
        const tgtLast7 = targetPhone.slice(-7)
        if (dbLast7 === tgtLast7) return true
      }
    }
    if (targetEmail && o.email && o.email.toLowerCase().includes(targetEmail)) return true
    return false
  })

  return Response.json({ items: filtered })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/loyalty?phone=xxx — public lookup of loyalty points by phone
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = (searchParams.get('phone') || '').trim()

  if (!phone) return Response.json({ error: 'phone required' }, { status: 400 })

  // Normalize phone for matching (digits only)
  const normalizePhone = (p: string) => p.replace(/\D/g, '')
  const targetDigits = normalizePhone(phone)
  const last7 = targetDigits.slice(-7)

  // Fetch all accounts and filter in JS for flexible matching
  const allAccounts = await db.loyaltyAccount.findMany({ take: 1000 })
  const account = allAccounts.find((a) => {
    const aDigits = normalizePhone(a.phone)
    return aDigits === targetDigits || aDigits.includes(targetDigits) || targetDigits.includes(aDigits) || (aDigits.length >= 7 && last7 && aDigits.slice(-7) === last7)
  })

  if (!account) {
    return Response.json({ account: null, message: 'No loyalty account found for this phone number.' })
  }

  // Also fetch recent orders for this phone
  const orders = await db.order.findMany({
    where: { phone: account.phone },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { orderNumber: true, total: true, orderStatus: true, loyaltyPoints: true, createdAt: true },
  })

  return Response.json({ account, recentOrders: orders })
}

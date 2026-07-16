import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Returns aggregated analytics data for the admin dashboard.
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  // ─── Revenue over last 30 days (daily) ────────────────────────────────────
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentOrders = await db.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { total: true, paymentStatus: true, orderStatus: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  // Bucket by day
  const revenueByDay: { date: string; revenue: number; orders: number }[] = []
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    dayMap.set(key, { revenue: 0, orders: 0 })
  }
  recentOrders.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10)
    const bucket = dayMap.get(key)
    if (bucket) {
      bucket.orders += 1
      if (o.paymentStatus === 'paid') bucket.revenue += o.total
    }
  })
  dayMap.forEach((val, key) => {
    const d = new Date(key)
    revenueByDay.push({
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: Math.round(val.revenue),
      orders: val.orders,
    })
  })

  // ─── Order status distribution ─────────────────────────────────────────────
  const allOrders = await db.order.findMany({ select: { orderStatus: true, paymentStatus: true, total: true } })
  const statusCounts: Record<string, number> = {}
  const paymentCounts: Record<string, number> = {}
  let totalRevenue = 0
  let pendingRevenue = 0
  allOrders.forEach((o) => {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1
    paymentCounts[o.paymentStatus] = (paymentCounts[o.paymentStatus] || 0) + 1
    if (o.paymentStatus === 'paid') totalRevenue += o.total
    else if (o.paymentStatus === 'pending') pendingRevenue += o.total
  })

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }))

  // ─── Top products by order count ───────────────────────────────────────────
  const topProductsRaw = await db.orderItem.groupBy({
    by: ['productName'],
    _count: { _all: true },
    _sum: { total: true },
    orderBy: { _count: { id: 'desc' } },
    take: 6,
  })
  const topProducts = topProductsRaw.map((p) => ({
    name: p.productName.length > 30 ? p.productName.slice(0, 27) + '...' : p.productName,
    orders: p._count._all,
    revenue: Math.round(p._sum.total || 0),
  }))

  // ─── Top categories by orders ──────────────────────────────────────────────
  const ordersWithItems = await db.order.findMany({
    select: { items: { select: { productName: true, qty: true } } },
  })
  // We don't have category in order items, so just count total items ordered
  const itemsSold = ordersWithItems.reduce((s, o) => s + o.items.reduce((qs, i) => qs + i.qty, 0), 0)

  // ─── AOV ───────────────────────────────────────────────────────────────────
  const aov = allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0

  // ─── Conversion: pending → paid ────────────────────────────────────────────
  const conversionRate = allOrders.length > 0
    ? Math.round((paymentCounts['paid'] || 0) / allOrders.length * 100)
    : 0

  return Response.json({
    revenueByDay,
    statusData,
    paymentData,
    topProducts,
    itemsSold,
    totals: {
      revenue: Math.round(totalRevenue),
      pendingRevenue: Math.round(pendingRevenue),
      totalOrders: allOrders.length,
      aov,
      conversionRate,
      paid: paymentCounts['paid'] || 0,
      pending: paymentCounts['pending'] || 0,
      failed: paymentCounts['failed'] || 0,
    },
  })
}

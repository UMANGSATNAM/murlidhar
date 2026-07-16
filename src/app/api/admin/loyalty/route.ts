import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Admin — list all loyalty accounts
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  const where: any = {}
  if (q) {
    where.OR = [
      { phone: { contains: q } },
      { name: { contains: q } },
      { email: { contains: q } },
    ]
  }

  const accounts = await db.loyaltyAccount.findMany({
    where,
    orderBy: { points: 'desc' },
    take: 200,
  })

  const total = await db.loyaltyAccount.count()

  return Response.json({ items: accounts, total })
}

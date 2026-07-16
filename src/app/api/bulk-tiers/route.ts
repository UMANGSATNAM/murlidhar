import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Public — list active bulk discount tiers
export async function GET() {
  const tiers = await db.bulkDiscountTier.findMany({
    where: { active: true },
    orderBy: { minQty: 'asc' },
  })
  return Response.json({ items: tiers })
}

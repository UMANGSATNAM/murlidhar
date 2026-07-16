import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: { _count: { select: { products: { where: { active: true } } } } },
  })
  return Response.json({ items: categories })
}

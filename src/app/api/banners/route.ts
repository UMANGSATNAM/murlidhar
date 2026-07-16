import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const banners = await db.banner.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })
  return Response.json({ items: banners })
}

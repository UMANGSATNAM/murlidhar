import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const testimonials = await db.testimonial.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ items: testimonials })
}

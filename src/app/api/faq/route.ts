import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' }, select: { faq: true } })
  let faqs: { q: string; a: string }[] = []
  if (settings?.faq) {
    try {
      faqs = JSON.parse(settings.faq)
    } catch {
      faqs = []
    }
  }
  return Response.json({ items: faqs })
}

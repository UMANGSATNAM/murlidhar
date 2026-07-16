import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!settings) return Response.json(null)
  // Strip sensitive payment secrets for public consumption
  const { razorpayKeySecret, ...publicSettings } = settings
  return Response.json(publicSettings)
}

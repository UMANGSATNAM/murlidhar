import { db } from '@/lib/db'
import { seedDatabase } from '@/lib/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  let settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!settings) {
    try {
      await seedDatabase()
      settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    } catch (err) {
      console.error('Failed to auto-seed on settings fetch:', err)
    }
  }
  if (!settings) return Response.json(null)
  // Strip sensitive payment secrets for public consumption
  const { razorpayKeySecret, ...publicSettings } = settings
  return Response.json(publicSettings)
}

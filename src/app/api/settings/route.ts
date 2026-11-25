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
  // Auto-migrate stale placeholder contact numbers if still present
  const staleUpdates: Record<string, string> = {}
  if (settings.phone === '9510737852') staleUpdates.phone = '9510737582'
  if (settings.altPhone === '079160 29127') staleUpdates.altPhone = '7016029127'
  if (settings.whatsapp === '919510737852') staleUpdates.whatsapp = '919510737582'
  if (Object.keys(staleUpdates).length > 0) {
    try {
      settings = await db.siteSettings.update({
        where: { id: 'default' },
        data: staleUpdates,
      })
    } catch (err) {
      console.error('Failed to migrate stale phone settings:', err)
    }
  }
  // Strip sensitive payment and SMTP secrets for public consumption
  const { razorpayKeySecret, smtpPass, resendApiKey, brevoApiKey, ...publicSettings } = settings as any
  return Response.json(publicSettings)
}

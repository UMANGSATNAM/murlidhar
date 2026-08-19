import { NextRequest } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { testSmtpConnection } from '@/lib/email'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  try {
    const body = await request.json()
    let { toEmail, provider, resendApiKey, brevoApiKey, smtpHost, smtpPort, smtpUser, smtpPass, smtpSecure, emailFrom } = body

    // Fall back to stored settings if some fields are not provided in payload
    const stored = await db.siteSettings.findUnique({ where: { id: 'default' } })
    if (stored) {
      provider = provider || stored.emailProvider || 'smtp'
      resendApiKey = resendApiKey || stored.resendApiKey || undefined
      brevoApiKey = brevoApiKey || stored.brevoApiKey || undefined
      smtpHost = smtpHost || stored.smtpHost || undefined
      smtpPort = smtpPort || stored.smtpPort || (stored.smtpSecure ? 465 : 587)
      smtpUser = smtpUser || stored.smtpUser || undefined
      smtpPass = smtpPass || stored.smtpPass || undefined
      smtpSecure = smtpSecure !== undefined ? smtpSecure : (stored.smtpSecure ?? (smtpPort === 465))
      emailFrom = emailFrom || stored.emailFrom || undefined
    }

    if (!toEmail) {
      return Response.json({ error: 'Target email address is required for testing' }, { status: 400 })
    }

    const result = await testSmtpConnection({
      toEmail,
      provider,
      resendApiKey,
      brevoApiKey,
      smtpHost,
      smtpPort: typeof smtpPort === 'number' ? smtpPort : parseInt(smtpPort, 10) || 587,
      smtpUser,
      smtpPass,
      smtpSecure: Boolean(smtpSecure),
      emailFrom,
    })

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({
      ok: true,
      message: `Test email sent successfully to ${toEmail}! Please check your inbox (and spam folder).`,
      messageId: result.messageId,
    })
  } catch (err: any) {
    console.error('[admin:email:test]', err)
    return Response.json({ error: err?.message || 'Server error testing email' }, { status: 500 })
  }
}

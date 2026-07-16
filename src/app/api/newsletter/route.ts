import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/newsletter — subscribe an email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email || '').toLowerCase().trim()
    const name = (body.name || '').trim()
    const source = body.source || 'footer'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Valid email required' }, { status: 400 })
    }

    // Upsert — if email exists, reactivate
    const existing = await db.newsletterSubscriber.findUnique({ where: { email } })
    if (existing) {
      await db.newsletterSubscriber.update({
        where: { email },
        data: { active: true, name: name || existing.name },
      })
      return Response.json({ ok: true, message: 'You are subscribed!' })
    }

    await db.newsletterSubscriber.create({
      data: { email, name: name || null, source, active: true },
    })
    return Response.json({ ok: true, message: 'Subscribed successfully!' })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Subscription failed' }, { status: 500 })
  }
}

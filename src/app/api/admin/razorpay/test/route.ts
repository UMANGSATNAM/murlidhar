import { NextRequest } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  try {
    const body = await request.json().catch(() => ({}))
    let { razorpayKeyId, razorpayKeySecret } = body

    if (!razorpayKeyId || !razorpayKeySecret) {
      const stored = await db.siteSettings.findUnique({ where: { id: 'default' } })
      if (stored) {
        razorpayKeyId = razorpayKeyId || stored.razorpayKeyId
        razorpayKeySecret = razorpayKeySecret || stored.razorpayKeySecret
      }
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return Response.json(
        { error: 'Please enter both Razorpay Key ID and Key Secret before testing.' },
        { status: 400 }
      )
    }

    const authHeader = `Basic ${Buffer.from(`${razorpayKeyId.trim()}:${razorpayKeySecret.trim()}`).toString('base64')}`

    // Fetch payments list with count=1 to verify credentials
    const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      headers: {
        Authorization: authHeader,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json(
        { error: data.error?.description || 'Razorpay key verification failed. Please check your Key ID and Secret.' },
        { status: 400 }
      )
    }

    return Response.json({
      ok: true,
      message: 'Razorpay API credentials verified successfully! Online payments are ready.',
    })
  } catch (err: any) {
    console.error('[admin:razorpay:test]', err)
    return Response.json({ error: err?.message || 'Failed to connect to Razorpay API' }, { status: 500 })
  }
}

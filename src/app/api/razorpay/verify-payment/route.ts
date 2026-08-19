import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return Response.json({ error: 'Missing Razorpay signature fields' }, { status: 400 })
    }

    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      return Response.json({ error: 'Razorpay secret is not configured' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret.trim())
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const isValid = expectedSignature === razorpay_signature

    if (!isValid) {
      return Response.json({ error: 'Payment signature verification failed' }, { status: 400 })
    }

    return Response.json({ ok: true, verified: true })
  } catch (err: any) {
    console.error('[razorpay:verify_payment_error]', err)
    return Response.json({ error: err?.message || 'Server error verifying payment' }, { status: 500 })
  }
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'INR', customerName, phone, email } = body

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    // Retrieve settings
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })

    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return Response.json(
        {
          error:
            'Razorpay payment gateway is not configured. Please enter your Razorpay Key ID and Key Secret in Admin Panel > Settings > Payment.',
        },
        { status: 400 }
      )
    }

    // Amount in paise (Razorpay expects smallest currency unit, 1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100)

    const authHeader = `Basic ${Buffer.from(`${keyId.trim()}:${keySecret.trim()}`).toString('base64')}`

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt: `murlidhar_${Date.now().toString().slice(-8)}`,
        notes: {
          customerName: customerName || '',
          phone: phone || '',
          email: email || '',
        },
      }),
    })

    const rzpData = await rzpResponse.json()

    if (!rzpResponse.ok) {
      console.error('[razorpay:create_order_error]', rzpData)
      return Response.json(
        { error: rzpData.error?.description || 'Failed to create Razorpay payment order' },
        { status: rzpResponse.status }
      )
    }

    return Response.json({
      ok: true,
      orderId: rzpData.id,
      amount: rzpData.amount,
      currency: rzpData.currency,
      keyId: keyId.trim(),
      businessName: settings?.businessName || 'Murlidhar Offset',
    })
  } catch (err: any) {
    console.error('[razorpay:create_order_exception]', err)
    return Response.json({ error: err?.message || 'Server error creating Razorpay order' }, { status: 500 })
  }
}

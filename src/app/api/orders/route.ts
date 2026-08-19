import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/format'
import { sendEmail, orderConfirmationHtml, adminOrderNotificationHtml } from '@/lib/email'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

// Public — create order from checkout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      remarks,
      items,
      paymentMethod = 'cod',
      paymentStatus = 'pending',
      paymentRef = null,
      files = [],
    } = body

    if (!customerName || !phone || !items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.unitPrice, 0)
    const shipping = 0 // free shipping

    // Apply bulk discount based on total quantity across all items
    const totalQty = items.reduce((s: number, i: any) => s + i.qty, 0)
    const bulkTiers = await db.bulkDiscountTier.findMany({ where: { active: true } })
    let bulkDiscount = 0
    let appliedTier: { minQty: number; discountPct: number } | null = null
    if (bulkTiers.length > 0) {
      for (const t of bulkTiers) {
        if (totalQty >= t.minQty) {
          if (!appliedTier || t.discountPct > appliedTier.discountPct) {
            appliedTier = { minQty: t.minQty, discountPct: t.discountPct }
          }
        }
      }
      if (appliedTier) {
        bulkDiscount = Math.round(subtotal * (appliedTier.discountPct / 100) * 100) / 100
      }
    }
    const total = Math.max(0, subtotal - bulkDiscount + shipping)

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        remarks: remarks
          ? `${remarks}${appliedTier ? `\n\n[Bulk Discount Applied: ${appliedTier.discountPct}% off for ordering ${totalQty}+ units — You saved ₹${bulkDiscount.toFixed(2)}]` : ''}`
          : appliedTier
          ? `[Bulk Discount Applied: ${appliedTier.discountPct}% off for ordering ${totalQty}+ units — You saved ₹${bulkDiscount.toFixed(2)}]`
          : null,
        subtotal,
        shipping,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'online' && paymentStatus === 'paid' ? 'paid' : 'pending',
        paymentRef: paymentRef || null,
        orderStatus: 'pending',
        items: {
          create: items.map((i: any) => ({
            productId: i.productId || null,
            productName: i.productName,
            variantId: i.variantId || null,
            variantInfo: i.variantLabel || null,
            qty: i.qty,
            unitPrice: i.unitPrice,
            total: i.qty * i.unitPrice,
          })),
        },
        files: files?.length
          ? {
              create: files.map((f: any) => ({
                fileName: f.name,
                filePath: f.url,
                fileSize: f.size || 0,
                fileType: f.type || null,
              })),
            }
          : undefined,
      },
      include: { items: true, files: true },
    })

    // Fetch settings for email triggers
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })

    // Compute site base URL for email image & file download links
    const hostHeader = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const siteUrl =
      process.env.NEXTAUTH_URL ||
      (hostHeader ? `${protocol}://${hostHeader}` : 'https://murlidhar-offset-production.up.railway.app')

    const orderFilesFormatted = order.files.map((f) => ({
      fileName: f.fileName,
      filePath: f.filePath,
      fileSize: f.fileSize,
    }))

    // 1. Customer Confirmation Email
    if (order.email) {
      try {
        const customerHtml = orderConfirmationHtml({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          email: order.email,
          address: order.address,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          paymentRef: order.paymentRef,
          subtotal: order.subtotal,
          discount: bulkDiscount,
          shipping: order.shipping,
          total: order.total,
          items: order.items.map((i) => ({
            productName: i.productName,
            variantInfo: i.variantInfo,
            qty: i.qty,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
          files: orderFilesFormatted,
          siteUrl,
          businessName: settings?.businessName || 'Murlidhar Offset',
        })

        await sendEmail({
          to: order.email,
          subject: `✅ Order Confirmation — ${order.orderNumber} (Murlidhar Offset)`,
          html: customerHtml,
        })
      } catch (e) {
        console.error('[email:customer_confirmation_error]', e)
      }
    }

    // 2. Admin New Order Alert Email (Sent to configured Admin email)
    const adminTargetEmail = settings?.adminNotifyEmail || settings?.email || 'murlidharoffset84@gmail.com'
    if (adminTargetEmail) {
      try {
        const adminHtml = adminOrderNotificationHtml({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          phone: order.phone,
          email: order.email,
          address: order.address,
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          paymentRef: order.paymentRef,
          remarks: order.remarks,
          total: order.total,
          items: order.items.map((i) => ({
            productName: i.productName,
            variantInfo: i.variantInfo,
            qty: i.qty,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
          files: orderFilesFormatted,
          siteUrl,
        })

        await sendEmail({
          to: adminTargetEmail,
          subject: `🚨 NEW ORDER #${order.orderNumber} - ₹${order.total.toFixed(2)} from ${order.customerName}`,
          html: adminHtml,
        })
      } catch (e) {
        console.error('[email:admin_notification_error]', e)
      }
    }

    // Auto-deduct loyalty points if redemption was applied
    const loyaltyMatch = remarks?.match(/\[LOYALTY REDEMPTION: Applied (\d+) points.*from phone ([^\]]+)\]/)
    if (loyaltyMatch) {
      const pointsToDeduct = parseInt(loyaltyMatch[1], 10)
      const redeemPhone = loyaltyMatch[2].trim()
      if (pointsToDeduct > 0) {
        try {
          const normalizePhone = (p: string) => p.replace(/\D/g, '')
          const targetDigits = normalizePhone(redeemPhone)
          const last7 = targetDigits.slice(-7)
          // Find matching account
          const allAccounts = await db.loyaltyAccount.findMany({ take: 1000 })
          const account = allAccounts.find((a) => {
            const aDigits = normalizePhone(a.phone)
            return aDigits === targetDigits || aDigits.includes(targetDigits) || targetDigits.includes(aDigits) || (aDigits.length >= 7 && last7 && aDigits.slice(-7) === last7)
          })
          if (account && account.points >= pointsToDeduct) {
            await db.loyaltyAccount.update({
              where: { id: account.id },
              data: {
                points: { decrement: pointsToDeduct },
                totalRedeemed: { increment: pointsToDeduct },
              },
            })
          }
        } catch (e) {
          console.error('[loyalty:deduct]', e)
        }
      }
    }

    return Response.json({ ok: true, order })
  } catch (err: any) {
    console.error('[orders:create]', err)
    return Response.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

// Admin — list orders
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const payment = searchParams.get('payment') || ''
  const q = searchParams.get('q') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

  const where: any = {}
  if (status) where.orderStatus = status
  if (payment) where.paymentStatus = payment
  if (q) {
    where.OR = [
      { orderNumber: { contains: q } },
      { customerName: { contains: q } },
      { phone: { contains: q } },
      { email: { contains: q } },
    ]
  }

  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { items: true, files: true } } },
    }),
  ])

  return Response.json({
    items: orders,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

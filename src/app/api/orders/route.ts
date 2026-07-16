import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/format'
import { sendEmail, orderConfirmationHtml } from '@/lib/email'
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
      files = [],
    } = body

    if (!customerName || !phone || !items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.unitPrice, 0)
    const shipping = 0 // free shipping for now

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
        paymentStatus: paymentMethod === 'cod' ? 'pending' : paymentMethod === 'payatshop' ? 'pending' : 'pending',
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

    // Send confirmation email (best effort)
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    if (settings?.email) {
      const html = orderConfirmationHtml({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: order.items.map((i) => ({
          name: i.productName,
          variant: i.variantInfo ?? undefined,
          qty: i.qty,
          total: i.total,
        })),
        total: order.total,
        business: settings.businessName,
      })
      // Customer email
      if (order.email) {
        await sendEmail({ to: order.email, subject: `Order Confirmation — ${order.orderNumber}`, html })
      }
      // Notify business inbox
      await sendEmail({
        to: settings.email,
        subject: `New Order ${order.orderNumber} — ${order.customerName}`,
        html: `<p>New order received.</p>${html}`,
      })
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

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

const DEFAULT_SETTINGS = {
  id: 'default',
  businessName: 'Murlidhar Offset',
  tagline: 'We Print Your Dreams on Paper',
  aboutText:
    'Murlidhar Offset is a family-run printing press in the heart of Unjha, Gujarat. For over three decades we have served businesses, families and institutions across North Gujarat with one promise — quality printing, delivered on time, at honest prices.\n\nEquipped with a Konica Minolta AccurioPrint C4065 digital press and a full suite of pre-press, post-press and finishing equipment, we handle everything from a single visiting card to large-volume commercial print runs. Our craft blends traditional Gujarati print sensibility with modern digital precision.',
  phone: '9510737852',
  altPhone: '079160 29127',
  email: 'murlidharoffset84@gmail.com',
  address: 'Shreeji Super Market, 7, Unjha, Gujarat 384170',
  hours: 'Open 24 hours',
  whatsapp: '919510737852',
  instagram: 'https://instagram.com',
  facebook: 'https://facebook.com',
  mapEmbedUrl: 'https://www.google.com/maps?q=Unjha,Gujarat,384170&output=embed',
  emailFrom: 'Murlidhar Offset <murlidharoffset84@gmail.com>',
  adminNotifyEmail: 'murlidharoffset84@gmail.com',
  emailEnabled: true,
  smtpPort: 587,
  smtpSecure: false,
  codEnabled: true,
  onlineEnabled: true,
  payAtShopEnabled: true,
  razorpayMode: 'test',
  metaTitle: 'Murlidhar Offset — Quality Printing Press in Unjha, Gujarat',
  metaDescription:
    'Premium printing press in Unjha, Gujarat. Visiting cards, wedding cards (kankotri), letterheads, bill books, flex banners, brochures, packaging & more.',
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return unauthorized()

    let settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      // Auto-create default settings if empty (e.g. fresh PostgreSQL DB)
      settings = await db.siteSettings.create({
        data: DEFAULT_SETTINGS,
      })
    }
    return Response.json(settings)
  } catch (err: any) {
    console.error('[admin:settings:GET]', err)
    return Response.json(
      { error: err?.message || 'Failed to fetch settings', ...DEFAULT_SETTINGS },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return unauthorized()

    const body = await request.json()

    // Sanitize and type-cast every field for PostgreSQL compatibility
    const sanitizedData: any = {
      businessName: body.businessName !== undefined ? String(body.businessName) : undefined,
      tagline: body.tagline !== undefined ? String(body.tagline) : undefined,
      aboutText: body.aboutText !== undefined ? String(body.aboutText) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      altPhone: body.altPhone !== undefined ? (body.altPhone ? String(body.altPhone) : null) : undefined,
      email: body.email !== undefined ? String(body.email) : undefined,
      address: body.address !== undefined ? String(body.address) : undefined,
      hours: body.hours !== undefined ? String(body.hours) : undefined,
      mapEmbedUrl: body.mapEmbedUrl !== undefined ? (body.mapEmbedUrl ? String(body.mapEmbedUrl) : null) : undefined,
      whatsapp: body.whatsapp !== undefined ? (body.whatsapp ? String(body.whatsapp) : null) : undefined,
      instagram: body.instagram !== undefined ? (body.instagram ? String(body.instagram) : null) : undefined,
      facebook: body.facebook !== undefined ? (body.facebook ? String(body.facebook) : null) : undefined,
      
      // Email config & SMTP / HTTP API
      emailProvider: body.emailProvider !== undefined ? String(body.emailProvider) : undefined,
      emailFrom: body.emailFrom !== undefined ? (body.emailFrom ? String(body.emailFrom) : null) : undefined,
      adminNotifyEmail: body.adminNotifyEmail !== undefined ? (body.adminNotifyEmail ? String(body.adminNotifyEmail) : null) : undefined,
      emailEnabled: body.emailEnabled !== undefined ? Boolean(body.emailEnabled) : undefined,
      smtpHost: body.smtpHost !== undefined ? (body.smtpHost ? String(body.smtpHost).trim() : null) : undefined,
      smtpPort: body.smtpPort !== undefined ? (body.smtpPort ? parseInt(body.smtpPort, 10) : 587) : undefined,
      smtpUser: body.smtpUser !== undefined ? (body.smtpUser ? String(body.smtpUser).trim() : null) : undefined,
      smtpPass: body.smtpPass !== undefined ? (body.smtpPass ? String(body.smtpPass).trim() : null) : undefined,
      smtpSecure: body.smtpSecure !== undefined ? Boolean(body.smtpSecure) : undefined,
      resendApiKey: body.resendApiKey !== undefined ? (body.resendApiKey ? String(body.resendApiKey).trim() : null) : undefined,
      brevoApiKey: body.brevoApiKey !== undefined ? (body.brevoApiKey ? String(body.brevoApiKey).trim() : null) : undefined,
      
      // Payment config
      razorpayKeyId: body.razorpayKeyId !== undefined ? (body.razorpayKeyId ? String(body.razorpayKeyId).trim() : null) : undefined,
      razorpayKeySecret: body.razorpayKeySecret !== undefined ? (body.razorpayKeySecret ? String(body.razorpayKeySecret).trim() : null) : undefined,
      razorpayMode: body.razorpayMode !== undefined ? String(body.razorpayMode) : undefined,
      codEnabled: body.codEnabled !== undefined ? Boolean(body.codEnabled) : undefined,
      onlineEnabled: body.onlineEnabled !== undefined ? Boolean(body.onlineEnabled) : undefined,
      payAtShopEnabled: body.payAtShopEnabled !== undefined ? Boolean(body.payAtShopEnabled) : undefined,
      
      // Templates & SEO
      templateOrderConfirm: body.templateOrderConfirm !== undefined ? (body.templateOrderConfirm ? String(body.templateOrderConfirm) : null) : undefined,
      templateStatusUpdate: body.templateStatusUpdate !== undefined ? (body.templateStatusUpdate ? String(body.templateStatusUpdate) : null) : undefined,
      metaTitle: body.metaTitle !== undefined ? (body.metaTitle ? String(body.metaTitle) : null) : undefined,
      metaDescription: body.metaDescription !== undefined ? (body.metaDescription ? String(body.metaDescription) : null) : undefined,
      faq: body.faq !== undefined ? (typeof body.faq === 'string' ? body.faq : JSON.stringify(body.faq)) : undefined,
      announcementBar: body.announcementBar !== undefined ? (typeof body.announcementBar === 'string' ? body.announcementBar : JSON.stringify(body.announcementBar)) : undefined,
    }

    // Remove undefined keys
    Object.keys(sanitizedData).forEach((key) => {
      if (sanitizedData[key] === undefined) {
        delete sanitizedData[key]
      }
    })

    const updated = await db.siteSettings.upsert({
      where: { id: 'default' },
      update: sanitizedData,
      create: {
        id: 'default',
        ...DEFAULT_SETTINGS,
        ...sanitizedData,
      },
    })

    return Response.json({ ok: true, settings: updated })
  } catch (err: any) {
    console.error('[admin:settings:PUT]', err)
    return Response.json({ error: err?.message || 'Failed to update settings' }, { status: 500 })
  }
}

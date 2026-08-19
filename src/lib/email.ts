import nodemailer from 'nodemailer'
import { db } from '@/lib/db'

export type SmtpConfig = {
  host?: string | null
  port?: number | null
  user?: string | null
  pass?: string | null
  secure?: boolean | null
  from?: string | null
}

/**
 * Send email via Resend HTTP REST API (HTTPS Port 443 - 100% immune to cloud SMTP port blocks)
 */
export async function sendViaResend({
  apiKey,
  from,
  to,
  subject,
  html,
  replyTo,
}: {
  apiKey: string
  from?: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const recipients = Array.isArray(to) ? to : [to]
  const sender = from || 'Murlidhar Offset <onboarding@resend.dev>'
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: recipients,
      subject,
      html,
      reply_to: replyTo,
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || `Resend API error (${res.status})`)
  }
  return { ok: true, messageId: data.id }
}

/**
 * Send email via Brevo HTTP REST API (HTTPS Port 443 - 100% immune to cloud SMTP port blocks)
 */
export async function sendViaBrevo({
  apiKey,
  fromEmail,
  fromName,
  to,
  subject,
  html,
  replyTo,
}: {
  apiKey: string
  fromEmail?: string
  fromName?: string
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const recipients = (Array.isArray(to) ? to : [to]).map((e) => ({ email: e.trim() }))
  const senderEmail = fromEmail || 'orders@murlidharoffset.com'
  const senderName = fromName || 'Murlidhar Offset'

  const payload: any = {
    sender: { name: senderName, email: senderEmail },
    to: recipients,
    subject,
    htmlContent: html,
  }
  if (replyTo) {
    payload.replyTo = { email: replyTo.trim() }
  }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey.trim(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || data.error || `Brevo API error (${res.status})`)
  }
  return { ok: true, messageId: data.messageId }
}

/**
 * Creates a Nodemailer transporter dynamically from SiteSettings or environment variables
 */
export async function getTransporter(overrideConfig?: SmtpConfig) {
  let host = overrideConfig?.host || process.env.SMTP_HOST
  let port = overrideConfig?.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined)
  let user = overrideConfig?.user || process.env.SMTP_USER
  let pass = overrideConfig?.pass || process.env.SMTP_PASS
  let secure = overrideConfig?.secure !== undefined ? overrideConfig.secure : (process.env.SMTP_SECURE === 'true')

  if (!host || !user) {
    try {
      const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
      if (settings) {
        host = host || settings.smtpHost || undefined
        port = port || settings.smtpPort || (settings.smtpSecure ? 465 : 587)
        user = user || settings.smtpUser || undefined
        pass = pass || settings.smtpPass || undefined
        secure = secure !== undefined ? secure : (settings.smtpSecure ?? (port === 465))
      }
    } catch (e) {
      console.error('[email:getSettingsError]', e)
    }
  }

  if (!host || !user || !pass) {
    return null
  }

  host = host.trim()
  user = user.trim()
  pass = pass.trim().replace(/\s+/g, '') // remove spaces from Google app passwords

  const isGmail = host.includes('gmail') || user.includes('@gmail.com')
  const finalPort = isGmail && (port === 587 || !port) && !secure ? 465 : (port || (secure ? 465 : 587))
  const finalSecure = isGmail && finalPort === 465 ? true : (secure ?? (finalPort === 465))

  return nodemailer.createTransport({
    host,
    port: finalPort,
    secure: finalSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  })
}

/**
 * Sends a real email via configured provider (Resend API / Brevo API / SMTP)
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}): Promise<{ ok: boolean; messageId?: string; error?: string; skipped?: boolean }> {
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } }).catch(() => null)
    
    // Check if email notifications are enabled
    if (settings && settings.emailEnabled === false) {
      console.log('[email:disabled] Notifications are turned off in settings. Skipping email to:', to)
      return { ok: true, skipped: true }
    }

    const provider = settings?.emailProvider || (settings?.resendApiKey ? 'resend' : settings?.brevoApiKey ? 'brevo' : 'smtp')

    // 1. Resend API
    if (provider === 'resend' || (settings?.resendApiKey && !settings?.smtpHost)) {
      const apiKey = settings?.resendApiKey || process.env.RESEND_API_KEY
      if (apiKey) {
        const result = await sendViaResend({
          apiKey,
          from: from || settings?.emailFrom || undefined,
          to,
          subject,
          html,
          replyTo: replyTo || settings?.email || undefined,
        })
        return { ok: true, messageId: result.messageId }
      }
    }

    // 2. Brevo API
    if (provider === 'brevo' || (settings?.brevoApiKey && !settings?.smtpHost) || settings?.smtpPass?.startsWith('xkeysib-')) {
      const apiKey = settings?.brevoApiKey || (settings?.smtpPass?.startsWith('xkeysib-') ? settings.smtpPass : process.env.BREVO_API_KEY)
      if (apiKey) {
        const result = await sendViaBrevo({
          apiKey,
          fromEmail: settings?.smtpUser || settings?.email || 'inhalorder@gmail.com',
          fromName: settings?.businessName || 'Murlidhar Offset',
          to,
          subject,
          html,
          replyTo: replyTo || settings?.email || undefined,
        })
        return { ok: true, messageId: result.messageId }
      }
    }

    // 3. SMTP (Nodemailer)
    const transporter = await getTransporter()
    const senderFrom =
      from ||
      settings?.emailFrom ||
      (settings?.smtpUser ? `Murlidhar Offset <${settings.smtpUser}>` : undefined) ||
      process.env.SMTP_FROM ||
      'Murlidhar Offset <orders@murlidharoffset.com>'

    if (!transporter) {
      console.warn('[email:no_smtp_configured] No email configuration found in Settings or ENV. Email logged only:', {
        to,
        subject,
      })
      return { ok: false, error: 'Email service is not configured in Admin Settings' }
    }

    const info = await transporter.sendMail({
      from: senderFrom,
      to: Array.isArray(to) ? to.join(', ') : to,
      replyTo: replyTo || settings?.email || 'murlidharoffset84@gmail.com',
      subject,
      html,
      text: text || subject,
    })

    console.log('[email:sent_success]', { messageId: info.messageId, to, subject })
    return { ok: true, messageId: info.messageId }
  } catch (err: any) {
    console.error('[email:error]', err?.message || err)
    return { ok: false, error: err?.message || 'Failed to send email' }
  }
}

/**
 * Test email connection and send a sample verification email
 */
export async function testSmtpConnection({
  toEmail,
  provider,
  resendApiKey,
  brevoApiKey,
  smtpHost,
  smtpPort,
  smtpUser,
  smtpPass,
  smtpSecure,
  emailFrom,
}: {
  toEmail: string
  provider?: 'smtp' | 'resend' | 'brevo'
  resendApiKey?: string
  brevoApiKey?: string
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  smtpSecure?: boolean
  emailFrom?: string
}) {
  const cleanTo = (toEmail || '').trim()
  if (!cleanTo) return { ok: false, error: 'Target email is required' }

  const activeProvider = provider || (resendApiKey ? 'resend' : brevoApiKey || smtpPass?.startsWith('xkeysib-') ? 'brevo' : 'smtp')

  // 1. Test Resend API
  if (activeProvider === 'resend' && resendApiKey) {
    try {
      const res = await sendViaResend({
        apiKey: resendApiKey,
        from: emailFrom || 'Murlidhar Offset <onboarding@resend.dev>',
        to: cleanTo,
        subject: '✅ Murlidhar Offset — Resend API Test Successful',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#0f1b33;color:#ffffff;padding:20px;border-radius:6px;text-align:center">
            <h1 style="margin:0;color:#eab308;font-size:24px">MURLIDHAR OFFSET</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#94a3b8">PRINTING & PACKAGING · UNJHA, GUJARAT</p>
          </div>
          <div style="padding:20px 0;text-align:center">
            <div style="display:inline-block;background:#dcfce7;color:#15803d;padding:8px 16px;border-radius:20px;font-weight:bold;font-size:14px;margin-bottom:16px">
              ✓ Resend HTTPS API Verified (100% Cloud Reliable)
            </div>
            <h2 style="color:#0f1b33;margin:0 0 10px">Email System Is Working 100% Real!</h2>
            <p style="color:#475569;font-size:14px">
              Your Resend API connection is verified. All order confirmations and alerts will be delivered instantly over HTTPS Port 443 without any SMTP firewall blocks.
            </p>
          </div>
        </div>`,
      })
      return { ok: true, messageId: res.messageId }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Resend API test failed' }
    }
  }

  // 2. Test Brevo API
  if (activeProvider === 'brevo' && (brevoApiKey || smtpPass?.startsWith('xkeysib-'))) {
    const key = brevoApiKey || (smtpPass?.startsWith('xkeysib-') ? smtpPass : '')
    try {
      const res = await sendViaBrevo({
        apiKey: key,
        fromEmail: smtpUser || 'inhalorder@gmail.com',
        fromName: 'Murlidhar Offset',
        to: cleanTo,
        subject: '✅ Murlidhar Offset — Brevo API Test Successful',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#0f1b33;color:#ffffff;padding:20px;border-radius:6px;text-align:center">
            <h1 style="margin:0;color:#eab308;font-size:24px">MURLIDHAR OFFSET</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#94a3b8">PRINTING & PACKAGING · UNJHA, GUJARAT</p>
          </div>
          <div style="padding:20px 0;text-align:center">
            <div style="display:inline-block;background:#dcfce7;color:#15803d;padding:8px 16px;border-radius:20px;font-weight:bold;font-size:14px;margin-bottom:16px">
              ✓ Brevo HTTPS API Verified (100% Cloud Reliable)
            </div>
            <h2 style="color:#0f1b33;margin:0 0 10px">Email System Is Working 100% Real!</h2>
            <p style="color:#475569;font-size:14px">
              Your Brevo API connection is verified. All order confirmations and alerts will be delivered instantly over HTTPS Port 443 without any SMTP firewall blocks.
            </p>
          </div>
        </div>`,
      })
      return { ok: true, messageId: res.messageId }
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Brevo API test failed' }
    }
  }

  // 3. Test SMTP
  const cleanHost = (smtpHost || 'smtp.gmail.com').trim()
  const cleanUser = (smtpUser || '').trim()
  const cleanPass = (smtpPass || '').trim().replace(/\s+/g, '')
  const isGmail = cleanHost.includes('gmail') || cleanUser.includes('@gmail.com')

  const configsToTry = [
    {
      host: cleanHost,
      port: smtpPort || (smtpSecure ? 465 : 587),
      secure: smtpSecure ?? (smtpPort === 465),
    },
  ]

  if (isGmail && (smtpPort === 587 || !smtpSecure)) {
    configsToTry.push({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
    })
  }

  let lastError = ''

  for (const cfg of configsToTry) {
    try {
      const transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 12000,
      })

      await transporter.verify()

      const sender = emailFrom || `Murlidhar Offset <${cleanUser}>`
      const info = await transporter.sendMail({
        from: sender,
        to: cleanTo,
        subject: '✅ Murlidhar Offset — Email Configuration Test Successful',
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
          <div style="background:#0f1b33;color:#ffffff;padding:20px;border-radius:6px;text-align:center">
            <h1 style="margin:0;color:#eab308;font-size:24px;letter-spacing:1px">MURLIDHAR OFFSET</h1>
            <p style="margin:4px 0 0;font-size:12px;letter-spacing:1px;color:#94a3b8">PRINTING & PACKAGING · UNJHA, GUJARAT</p>
          </div>
          <div style="padding:20px 0;text-align:center">
            <div style="display:inline-block;background:#dcfce7;color:#15803d;padding:8px 16px;border-radius:20px;font-weight:bold;font-size:14px;margin-bottom:16px">
              ✓ SMTP Connection Verified
            </div>
            <h2 style="color:#0f1b33;margin:0 0 10px">Email Settings Are Working 100% Real!</h2>
            <p style="color:#475569;font-size:14px;line-height:1.5">
              Your SMTP settings have been validated successfully. All future customer order confirmations and admin order notifications will be delivered instantly through this configuration.
            </p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;background:#f8fafc;border-radius:6px;overflow:hidden">
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b;width:140px"><strong>SMTP Host:</strong></td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f1b33">${cfg.host}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b"><strong>SMTP Port:</strong></td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f1b33">${cfg.port} (${cfg.secure ? 'SSL' : 'TLS/STARTTLS'})</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#64748b"><strong>Username / From:</strong></td>
              <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;color:#0f1b33">${cleanUser}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;color:#64748b"><strong>Tested At:</strong></td>
              <td style="padding:10px 14px;color:#0f1b33">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center">
            Murlidhar Offset · Shreeji Super Market, 7, Unjha, Gujarat 384170 · Phone: +91 9510737852
          </div>
        </div>
        `,
      })

      return { ok: true, messageId: info.messageId, portUsed: cfg.port }
    } catch (err: any) {
      lastError = err?.message || 'SMTP connection failed'
      console.warn(`[email:test_attempt_failed] Port ${cfg.port}:`, lastError)
    }
  }

  return {
    ok: false,
    error: `${lastError}. (Note: If deploying on cloud hosts like Railway/DigitalOcean, SMTP ports 465/587 may be blocked. Use Brevo or Resend HTTPS API preset for 100% reliable cloud email delivery.)`,
  }
}

/**
 * Customer Order Confirmation HTML Template
 */
export function orderConfirmationHtml(opts: {
  orderNumber: string
  customerName: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  paymentMethod: string
  paymentStatus: string
  paymentRef?: string | null
  subtotal: number
  discount?: number
  shipping?: number
  total: number
  items: { productName: string; variantInfo?: string | null; qty: number; unitPrice: number; total: number }[]
  businessName?: string
}) {
  const business = opts.businessName || 'Murlidhar Offset'
  const isPaid = opts.paymentStatus === 'paid'
  const paymentBadge = isPaid
    ? `<span style="background:#dcfce7;color:#15803d;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">PAID ONLINE (Razorpay)</span>`
    : opts.paymentMethod === 'cod'
    ? `<span style="background:#fef3c7;color:#b45309;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">Cash on Delivery (Pending)</span>`
    : `<span style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">Pay at Shop (Pending)</span>`

  const rows = opts.items
    .map(
      (i) => `<tr>
      <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0">
        <strong style="color:#0f1b33;font-size:14px">${i.productName}</strong>
        ${i.variantInfo ? `<br/><span style="color:#64748b;font-size:12px">${i.variantInfo}</span>` : ''}
      </td>
      <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#334155;font-size:14px">${i.qty}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f1b33;font-weight:600;font-size:14px">₹${i.total.toFixed(2)}</td>
    </tr>`
    )
    .join('')

  const fullAddress = [opts.address, opts.city, opts.state, opts.pincode].filter(Boolean).join(', ')

  return `
  <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:10px">
    <!-- Header -->
    <div style="background:#0f1b33;color:#ffffff;padding:24px;border-radius:8px;text-align:center">
      <h1 style="margin:0;color:#eab308;font-size:26px;letter-spacing:1px;font-family:Georgia,serif">${business}</h1>
      <p style="margin:6px 0 0;font-size:12px;letter-spacing:1.5px;color:#cbd5e1;text-transform:uppercase">We Print Your Dreams on Paper · Unjha, Gujarat</p>
    </div>

    <!-- Success Message -->
    <div style="background:#ffffff;padding:24px;border-radius:8px;margin-top:16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #f1f5f9">
        <h2 style="color:#0f1b33;margin:0 0 6px;font-size:20px">🎉 Order Confirmed!</h2>
        <p style="color:#64748b;font-size:14px;margin:0">Thank you, <strong>${opts.customerName}</strong>. We've received your order and our production team is preparing it.</p>
      </div>

      <!-- Order Key Details Box -->
      <table style="width:100%;margin:16px 0;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;padding:12px">
        <tr>
          <td style="padding:6px 12px;color:#64748b;font-size:13px"><strong>Order Number:</strong></td>
          <td style="padding:6px 12px;text-align:right;color:#0f1b33;font-weight:bold;font-size:15px">${opts.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#64748b;font-size:13px"><strong>Payment Method:</strong></td>
          <td style="padding:6px 12px;text-align:right">${paymentBadge}</td>
        </tr>
        ${
          opts.paymentRef
            ? `<tr>
          <td style="padding:6px 12px;color:#64748b;font-size:13px"><strong>Payment ID:</strong></td>
          <td style="padding:6px 12px;text-align:right;color:#0f1b33;font-size:12px;font-family:monospace">${opts.paymentRef}</td>
        </tr>`
            : ''
        }
        ${
          fullAddress
            ? `<tr>
          <td style="padding:6px 12px;color:#64748b;font-size:13px;vertical-align:top"><strong>Delivery Address:</strong></td>
          <td style="padding:6px 12px;text-align:right;color:#334155;font-size:13px">${fullAddress}</td>
        </tr>`
            : ''
        }
      </table>

      <!-- Items Table -->
      <h3 style="color:#0f1b33;font-size:16px;margin:20px 0 10px">Ordered Items</h3>
      <table style="width:100%;border-collapse:collapse;margin:8px 0;background:#ffffff">
        <thead>
          <tr style="background:#0f1b33;color:#ffffff">
            <th style="padding:10px;text-align:left;font-size:13px;border-top-left-radius:6px">Item / Specs</th>
            <th style="padding:10px;text-align:center;font-size:13px">Qty</th>
            <th style="padding:10px;text-align:right;font-size:13px;border-top-right-radius:6px">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:10px;text-align:right;color:#64748b;font-size:13px">Subtotal:</td>
            <td style="padding:10px;text-align:right;color:#0f1b33;font-weight:600;font-size:14px">₹${opts.subtotal.toFixed(2)}</td>
          </tr>
          ${
            opts.discount && opts.discount > 0
              ? `<tr>
            <td colspan="2" style="padding:6px 10px;text-align:right;color:#16a34a;font-size:13px">Discount Applied:</td>
            <td style="padding:6px 10px;text-align:right;color:#16a34a;font-weight:600;font-size:14px">-₹${opts.discount.toFixed(2)}</td>
          </tr>`
              : ''
          }
          <tr>
            <td colspan="2" style="padding:6px 10px;text-align:right;color:#16a34a;font-size:13px">Delivery / Shipping:</td>
            <td style="padding:6px 10px;text-align:right;color:#16a34a;font-weight:bold;font-size:13px">FREE</td>
          </tr>
          <tr style="background:#f8fafc;border-top:2px solid #0f1b33">
            <td colspan="2" style="padding:12px 10px;text-align:right;font-weight:bold;color:#0f1b33;font-size:16px">Final Total:</td>
            <td style="padding:12px 10px;text-align:right;font-weight:bold;color:#0f1b33;font-size:18px">₹${opts.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Next Steps & Assistance -->
      <div style="margin-top:24px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px">
        <h4 style="margin:0 0 6px;color:#166534;font-size:14px">⚡ What Happens Next?</h4>
        <ul style="margin:0;padding-left:18px;color:#15803d;font-size:13px;line-height:1.6">
          <li>Our design team reviews your artwork and print specs.</li>
          <li>We will initiate printing on our Konica Minolta digital press.</li>
          <li>You will receive live email updates when your order is ready / dispatched.</li>
        </ul>
      </div>

      <div style="margin-top:20px;text-align:center">
        <a href="https://wa.me/919510737852?text=Hello%20Murlidhar%20Offset,%20regarding%20my%20order%20${encodeURIComponent(opts.orderNumber)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:bold;font-size:13px;margin:4px">
          💬 Chat on WhatsApp
        </a>
        <a href="tel:9510737852" style="display:inline-block;background:#0f1b33;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:bold;font-size:13px;margin:4px">
          📞 Call: 9510737852
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:20px;text-align:center;font-size:12px;color:#94a3b8">
      Murlidhar Offset · Shreeji Super Market, 7, Unjha, Gujarat 384170<br/>
      Email: murlidharoffset84@gmail.com · Phone: +91 9510737852
    </div>
  </div>`
}

/**
 * Admin Notification Email HTML Template (Alerting Admin about New Orders)
 */
export function adminOrderNotificationHtml(opts: {
  orderNumber: string
  customerName: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  paymentMethod: string
  paymentStatus: string
  paymentRef?: string | null
  remarks?: string | null
  total: number
  items: { productName: string; variantInfo?: string | null; qty: number; unitPrice: number; total: number }[]
  files?: { fileName: string; filePath: string; fileSize: number }[]
  siteUrl?: string
}) {
  const isPaid = opts.paymentStatus === 'paid'
  const paymentBadge = isPaid
    ? `<span style="background:#dcfce7;color:#15803d;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">PAID ONLINE (Razorpay)</span>`
    : `<span style="background:#fef3c7;color:#b45309;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:bold">COD / Pay at Shop (Pending)</span>`

  const fullAddress = [opts.address, opts.city, opts.state, opts.pincode].filter(Boolean).join(', ')

  const itemsList = opts.items
    .map(
      (i) => `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px">
        <strong>${i.productName}</strong>
        ${i.variantInfo ? `<br/><span style="color:#64748b;font-size:12px">${i.variantInfo}</span>` : ''}
      </td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px">${i.qty}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;font-size:13px">₹${i.total.toFixed(2)}</td>
    </tr>`
    )
    .join('')

  const filesHtml =
    opts.files && opts.files.length > 0
      ? `<div style="margin-top:16px;background:#f8fafc;padding:12px;border-radius:6px;border:1px solid #e2e8f0">
      <h4 style="margin:0 0 8px;color:#0f1b33;font-size:13px">📎 Uploaded Artwork Files (${opts.files.length}):</h4>
      <ul style="margin:0;padding-left:20px;font-size:13px">
        ${opts.files
          .map(
            (f) => `<li style="margin-bottom:4px">
          <a href="${f.filePath.startsWith('http') ? f.filePath : `${opts.siteUrl || ''}${f.filePath}`}" target="_blank" style="color:#2563eb;font-weight:bold;text-decoration:underline">
            ${f.fileName}
          </a> <span style="color:#64748b;font-size:11px">(${(f.fileSize / 1024).toFixed(0)} KB)</span>
        </li>`
          )
          .join('')}
      </ul>
    </div>`
      : ''

  return `
  <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#ffffff;padding:20px;border:2px solid #0f1b33;border-radius:8px">
    <!-- Urgent Admin Alert Banner -->
    <div style="background:#0f1b33;color:#ffffff;padding:16px;border-radius:6px;text-align:center">
      <h2 style="margin:0;color:#eab308;font-size:22px">🚨 NEW ORDER RECEIVED!</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#cbd5e1">Order <strong>#${opts.orderNumber}</strong> · Amount: <strong style="color:#4ade80">₹${opts.total.toFixed(2)}</strong></p>
    </div>

    <!-- Customer Details Card -->
    <div style="margin-top:16px;background:#f8fafc;padding:16px;border-radius:6px;border:1px solid #e2e8f0">
      <h3 style="margin:0 0 10px;color:#0f1b33;font-size:15px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">👤 Customer Details</h3>
      <table style="width:100%;font-size:13px">
        <tr>
          <td style="padding:4px 0;color:#64748b;width:120px"><strong>Name:</strong></td>
          <td style="padding:4px 0;color:#0f1b33;font-weight:bold">${opts.customerName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b"><strong>Phone:</strong></td>
          <td style="padding:4px 0">
            <a href="tel:${opts.phone}" style="color:#2563eb;font-weight:bold;text-decoration:none">📞 ${opts.phone}</a>
            <a href="https://wa.me/91${opts.phone.replace(/\\D/g, '')}" style="margin-left:10px;color:#16a34a;font-weight:bold;text-decoration:none">💬 WhatsApp</a>
          </td>
        </tr>
        ${
          opts.email
            ? `<tr>
          <td style="padding:4px 0;color:#64748b"><strong>Email:</strong></td>
          <td style="padding:4px 0"><a href="mailto:${opts.email}" style="color:#2563eb">${opts.email}</a></td>
        </tr>`
            : ''
        }
        ${
          fullAddress
            ? `<tr>
          <td style="padding:4px 0;color:#64748b;vertical-align:top"><strong>Address:</strong></td>
          <td style="padding:4px 0;color:#0f1b33">${fullAddress}</td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding:4px 0;color:#64748b"><strong>Payment:</strong></td>
          <td style="padding:4px 0">${paymentBadge} ${opts.paymentRef ? `<span style="font-size:11px;color:#64748b">(${opts.paymentRef})</span>` : ''}</td>
        </tr>
      </table>
    </div>

    <!-- Items Section -->
    <div style="margin-top:16px">
      <h3 style="margin:0 0 8px;color:#0f1b33;font-size:15px">📦 Ordered Items</h3>
      <table style="width:100%;border-collapse:collapse;background:#ffffff">
        <thead>
          <tr style="background:#e2e8f0;color:#0f1b33">
            <th style="padding:8px 10px;text-align:left;font-size:12px">Item</th>
            <th style="padding:8px 10px;text-align:center;font-size:12px">Qty</th>
            <th style="padding:8px 10px;text-align:right;font-size:12px">Total</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
        <tfoot>
          <tr style="border-top:2px solid #0f1b33;font-weight:bold">
            <td colspan="2" style="padding:10px;text-align:right">Total Order Value:</td>
            <td style="padding:10px;text-align:right;color:#0f1b33;font-size:16px">₹${opts.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${filesHtml}

    ${
      opts.remarks
        ? `<div style="margin-top:16px;background:#fffbeb;border:1px solid #fef3c7;padding:12px;border-radius:6px">
      <h4 style="margin:0 0 4px;color:#92400e;font-size:13px">📝 Customer Remarks / Special Request:</h4>
      <p style="margin:0;color:#78350f;font-size:13px;white-space:pre-wrap">${opts.remarks}</p>
    </div>`
        : ''
    }

    <!-- Admin CTA -->
    <div style="margin-top:20px;text-align:center;padding:12px;background:#f1f5f9;border-radius:6px">
      <p style="margin:0 0 10px;font-size:13px;color:#475569">Open your Admin Panel to view complete order history, update status or download invoice:</p>
      <a href="/admin/orders" style="display:inline-block;background:#0f1b33;color:#eab308;text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:bold;font-size:14px">
        Go to Admin Panel →
      </a>
    </div>
  </div>`
}

/**
 * Customer Order Status Update HTML Template
 */
export function statusUpdateHtml(opts: {
  orderNumber: string
  customerName: string
  status: string
  note?: string | null
  business?: string
}) {
  const business = opts.business || 'Murlidhar Offset'
  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    production: { label: 'IN PRODUCTION', color: '#1e40af', bg: '#dbeafe' },
    ready: { label: 'READY FOR PICKUP / DISPATCH', color: '#15803d', bg: '#dcfce7' },
    dispatched: { label: 'DISPATCHED', color: '#7e22ce', bg: '#f3e8ff' },
    delivered: { label: 'DELIVERED', color: '#166534', bg: '#bbf7d0' },
    cancelled: { label: 'CANCELLED', color: '#991b1b', bg: '#fee2e2' },
  }

  const badge = statusLabels[opts.status] || { label: opts.status.toUpperCase(), color: '#0f1b33', bg: '#e2e8f0' }

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:8px">
    <div style="background:#0f1b33;color:#ffffff;padding:20px;border-radius:6px;text-align:center">
      <h1 style="margin:0;color:#eab308;font-size:24px;font-family:Georgia,serif">${business}</h1>
      <p style="margin:4px 0 0;font-size:12px;letter-spacing:1px;color:#cbd5e1">ORDER STATUS UPDATE</p>
    </div>
    <div style="background:#ffffff;padding:20px;border-radius:6px;margin-top:16px;border:1px solid #e2e8f0">
      <p style="font-size:15px;color:#0f1b33;margin:0 0 12px">Dear <strong>${opts.customerName}</strong>,</p>
      <p style="color:#475569;font-size:14px;margin:0 0 16px">Your order <strong>#${opts.orderNumber}</strong> status has been updated:</p>
      <div style="text-align:center;margin:20px 0">
        <span style="display:inline-block;background:${badge.bg};color:${badge.color};padding:10px 24px;border-radius:24px;font-weight:bold;font-size:14px;letter-spacing:1px">
          ${badge.label}
        </span>
      </div>
      ${
        opts.note
          ? `<div style="margin:16px 0;background:#f8fafc;border-left:4px solid #eab308;padding:12px">
        <p style="margin:0;font-size:13px;color:#334155"><strong>Note from ${business}:</strong><br/>${opts.note}</p>
      </div>`
          : ''
      }
      <p style="font-size:13px;color:#64748b;margin-top:20px">You can track your order status anytime on our website or reply directly to this email if you have any questions.</p>
    </div>
    <div style="margin-top:20px;text-align:center;font-size:12px;color:#94a3b8">
      ${business} · Unjha, Gujarat · Phone: +91 9510737852
    </div>
  </div>`
}

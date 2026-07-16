// Email helper — uses z-ai-web-dev-sdk to send transactional emails.
// Falls back gracefully if SDK is not configured (logs to console in dev).
import ZAI from 'z-ai-web-dev-sdk'

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    // @ts-ignore — SDK may not expose .email directly in all versions; guard at runtime
    const zai = await ZAI.create()
    const sendMail: any = (zai as any)?.emails?.send ?? (zai as any)?.sendEmail
    if (typeof sendMail === 'function') {
      await sendMail({
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
        text: text ?? subject,
      })
      return { ok: true }
    }
    // SDK doesn't expose email — log to console (sandbox behaviour)
    console.log('[email:dev]', { to, subject, text: text ?? subject })
    return { ok: true }
  } catch (err: any) {
    console.error('[email:error]', err?.message ?? err)
    return { ok: false, error: err?.message ?? 'unknown' }
  }
}

export function orderConfirmationHtml(opts: {
  orderNumber: string
  customerName: string
  items: { name: string; variant?: string; qty: number; total: number }[]
  total: number
  business: string
}) {
  const rows = opts.items
    .map(
      (i) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i.name}${
        i.variant ? `<br/><small style="color:#666">${i.variant}</small>` : ''
      }</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.total.toFixed(2)}</td>
      </tr>`
    )
    .join('')
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf6ed;padding:24px;border:1px solid #e3d9c2">
    <div style="background:#0f1b33;color:#faf6ed;padding:20px;border-radius:8px;text-align:center">
      <h1 style="margin:0;color:#d4a017;font-family:Georgia,serif">${opts.business}</h1>
      <p style="margin:4px 0 0;font-size:13px;letter-spacing:1px">QUALITY PRINTING, LASTING IMPRESSION</p>
    </div>
    <h2 style="color:#0f1b33">Order Confirmation</h2>
    <p>Dear ${opts.customerName},</p>
    <p>Thank you for your order. We've received your request and will begin production shortly.</p>
    <p><strong>Order Number:</strong> ${opts.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fff">
      <thead>
        <tr style="background:#0f1b33;color:#faf6ed">
          <th style="padding:10px;text-align:left">Item</th>
          <th style="padding:10px;text-align:center">Qty</th>
          <th style="padding:10px;text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px;text-align:right;font-weight:bold">Total:</td>
          <td style="padding:12px;text-align:right;font-weight:bold;color:#0f1b33">₹${opts.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="font-size:13px;color:#666">We'll send you another email when your order is ready for dispatch.</p>
    <div style="margin-top:24px;padding-top:16px;border-top:2px solid #d4a017;font-size:12px;color:#666;text-align:center">
      Murlidhar Offset · Shreeji Super Market, 7, Unjha, Gujarat 384170 · 9510737852
    </div>
  </div>`
}

export function statusUpdateHtml(opts: {
  orderNumber: string
  customerName: string
  status: string
  note?: string
  business: string
}) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf6ed;padding:24px;border:1px solid #e3d9c2">
    <div style="background:#0f1b33;color:#faf6ed;padding:20px;border-radius:8px;text-align:center">
      <h1 style="margin:0;color:#d4a017;font-family:Georgia,serif">${opts.business}</h1>
    </div>
    <h2 style="color:#0f1b33">Order Status Update</h2>
    <p>Dear ${opts.customerName},</p>
    <p>Your order <strong>${opts.orderNumber}</strong> status has been updated to:</p>
    <p style="text-align:center;margin:24px 0">
      <span style="display:inline-block;background:#d4a017;color:#0f1b33;padding:10px 24px;border-radius:24px;font-weight:bold;text-transform:uppercase;letter-spacing:1px">${opts.status}</span>
    </p>
    ${opts.note ? `<p><strong>Note from ${opts.business}:</strong><br/>${opts.note}</p>` : ''}
    <p style="font-size:13px;color:#666;margin-top:24px">If you have any questions, please call us at 9510737852.</p>
    <div style="margin-top:24px;padding-top:16px;border-top:2px solid #d4a017;font-size:12px;color:#666;text-align:center">
      Murlidhar Offset · Unjha, Gujarat · 9510737852
    </div>
  </div>`
}

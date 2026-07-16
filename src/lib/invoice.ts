// Invoice PDF generator — builds a branded Murlidhar Offset invoice client-side using jsPDF.
// Brand colours: navy #0F1B33, gold #0d9488, cream #FAF6ED
import jsPDF from 'jspdf'

export interface InvoiceItem {
  productName: string
  variantInfo?: string | null
  qty: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  orderNumber: string
  customerName: string
  phone: string
  email?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  remarks?: string | null
  items: InvoiceItem[]
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
  business?: {
    name: string
    phone: string
    email: string
    address: string
  }
}

const NAVY: [number, number, number] = [15, 27, 51]
const GOLD: [number, number, number] = [212, 160, 23]
const CREAM: [number, number, number] = [250, 246, 237]
const MUTED: [number, number, number] = [90, 84, 70]

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentW = pageW - margin * 2

  // ─── Top navy band ────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 110, 'F')

  // Gold accent line under navy band
  doc.setFillColor(...GOLD)
  doc.rect(0, 110, pageW, 3, 'F')

  // Business name (left)
  doc.setTextColor(...CREAM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(data.business?.name || 'Murlidhar Offset', margin, 50)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(212, 160, 23)
  doc.text('QUALITY PRINTING · LASTING IMPRESSION', margin, 66)

  doc.setTextColor(200, 200, 200)
  doc.setFontSize(8)
  const bizLines = [
    data.business?.address || 'Shreeji Super Market, 7, Unjha, Gujarat 384170',
    `Phone: ${data.business?.phone || '9510737852'}  ·  Email: ${data.business?.email || 'murlidharoffset84@gmail.com'}`,
  ]
  bizLines.forEach((line, i) => doc.text(line, margin, 82 + i * 11))

  // Invoice title (right)
  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('INVOICE', pageW - margin, 50, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...CREAM)
  doc.text(`#${data.orderNumber}`, pageW - margin, 66, { align: 'right' })
  const invDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  doc.text(`Date: ${invDate}`, pageW - margin, 80, { align: 'right' })

  // ─── Bill To section ─────────────────────────────────────────────────────
  let y = 140
  doc.setTextColor(...MUTED)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', margin, y)

  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(data.customerName, margin, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(60, 60, 60)
  let by = y + 28
  doc.text(`Phone: ${data.phone}`, margin, by); by += 12
  if (data.email) { doc.text(`Email: ${data.email}`, margin, by); by += 12 }
  if (data.address) {
    const addr = [data.address, data.city, data.state, data.pincode].filter(Boolean).join(', ')
    doc.text(addr, margin, by); by += 12
  }

  // ─── Status box (right) ──────────────────────────────────────────────────
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1)
  doc.roundedRect(pageW - margin - 180, y - 10, 180, 70, 4, 4, 'S')
  doc.setFillColor(...CREAM)
  doc.roundedRect(pageW - margin - 180, y - 10, 180, 70, 4, 4, 'F')

  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER STATUS', pageW - margin - 170, y + 4)
  doc.text('PAYMENT STATUS', pageW - margin - 170, y + 28)
  doc.text('PAYMENT METHOD', pageW - margin - 170, y + 52)

  doc.setFontSize(10)
  doc.setTextColor(...NAVY)
  doc.text(data.orderStatus.toUpperCase(), pageW - margin - 80, y + 4, { align: 'right' })
  const payColor: [number, number, number] = data.paymentStatus === 'paid' ? [22, 101, 52] : [180, 83, 9]
  doc.setTextColor(...payColor)
  doc.text(data.paymentStatus.toUpperCase(), pageW - margin - 80, y + 28, { align: 'right' })
  doc.setTextColor(...NAVY)
  doc.text(data.paymentMethod.toUpperCase(), pageW - margin - 80, y + 52, { align: 'right' })

  // ─── Items table ─────────────────────────────────────────────────────────
  y = 240
  // Table header
  doc.setFillColor(...NAVY)
  doc.rect(margin, y, contentW, 24, 'F')
  doc.setTextColor(...CREAM)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('ITEM DESCRIPTION', margin + 10, y + 16)
  doc.text('QTY', margin + contentW - 200, y + 16, { align: 'right' })
  doc.text('UNIT PRICE', margin + contentW - 110, y + 16, { align: 'right' })
  doc.text('AMOUNT', margin + contentW - 10, y + 16, { align: 'right' })

  y += 24
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  let altBg = false
  data.items.forEach((item, i) => {
    if (altBg) {
      doc.setFillColor(250, 246, 237)
      doc.rect(margin, y, contentW, 28, 'F')
    }
    altBg = !altBg

    doc.setTextColor(...NAVY)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    // Truncate long product names
    const name = item.productName.length > 55 ? item.productName.slice(0, 52) + '...' : item.productName
    doc.text(name, margin + 10, y + 12)

    if (item.variantInfo) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...MUTED)
      const variant = item.variantInfo.length > 65 ? item.variantInfo.slice(0, 62) + '...' : item.variantInfo
      doc.text(variant, margin + 10, y + 22)
    }

    doc.setTextColor(60, 60, 60)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(String(item.qty), margin + contentW - 200, y + 14, { align: 'right' })
    doc.text(formatINRShort(item.unitPrice), margin + contentW - 110, y + 14, { align: 'right' })

    doc.setTextColor(...NAVY)
    doc.setFont('helvetica', 'bold')
    doc.text(formatINRShort(item.total), margin + contentW - 10, y + 14, { align: 'right' })

    y += 28
    // Add page break if needed
    if (y > pageH - 180) {
      doc.addPage()
      y = margin
    }
  })

  // ─── Totals ───────────────────────────────────────────────────────────────
  // Gold separator line
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1)
  doc.line(margin, y, margin + contentW, y)
  y += 16

  const totalsX = margin + contentW - 200
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Subtotal', totalsX, y)
  doc.setTextColor(...NAVY)
  doc.text(formatINRShort(data.subtotal), margin + contentW - 10, y, { align: 'right' })
  y += 14

  doc.setTextColor(...MUTED)
  doc.text('Shipping', totalsX, y)
  if (data.shipping === 0) {
    doc.setTextColor(22, 101, 52)
    doc.setFont('helvetica', 'bold')
    doc.text('FREE', margin + contentW - 10, y, { align: 'right' })
  } else {
    doc.setTextColor(...NAVY)
    doc.text(formatINRShort(data.shipping), margin + contentW - 10, y, { align: 'right' })
  }
  y += 14

  doc.setTextColor(...MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text('Tax', totalsX, y)
  doc.setTextColor(...NAVY)
  doc.text('Included', margin + contentW - 10, y, { align: 'right' })
  y += 8

  // Total row (gold band)
  y += 6
  doc.setFillColor(...NAVY)
  doc.rect(totalsX - 10, y, 210, 28, 'F')
  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL', totalsX, y + 18)
  doc.setTextColor(...CREAM)
  doc.setFontSize(14)
  doc.text(formatINRShort(data.total), margin + contentW - 10, y + 18, { align: 'right' })

  // ─── Remarks (if any) ─────────────────────────────────────────────────────
  if (data.remarks) {
    y += 50
    doc.setDrawColor(...GOLD)
    doc.setLineWidth(0.5)
    doc.line(margin, y, margin + contentW, y)
    y += 14
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('CUSTOMER REMARKS', margin, y)
    y += 12
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(60, 60, 60)
    const remarksLines = doc.splitTextToSize(data.remarks, contentW)
    doc.text(remarksLines, margin, y)
  }

  // ─── Footer ──────────────────────────────────────────────────────────────
  const footerY = pageH - 60
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY - 20, margin + contentW, footerY - 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.text('Thank you for your business!', margin, footerY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('This is a computer-generated invoice and does not require a physical signature.', margin, footerY + 12)

  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text(
    `${data.business?.name || 'Murlidhar Offset'} · ${data.business?.address || 'Unjha, Gujarat'} · ${data.business?.phone || '9510737852'}`,
    pageW - margin, footerY, { align: 'right' }
  )

  return doc
}

function formatINRShort(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n)
}

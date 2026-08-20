// Invoice PDF generator — builds an ultra-classic, professional tax invoice for Murlidhar Offset using jsPDF.
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
  discount?: number
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
    gstin?: string
  }
}

// Brand RGB colors
const NAVY: [number, number, number] = [15, 27, 51] // #0F1B33 Deep Corporate Navy
const TEAL: [number, number, number] = [13, 148, 136] // #0D9488 Vibrant Accent
const GOLD: [number, number, number] = [217, 119, 6] // #D97706 Warm Gold Accent
const WHITE: [number, number, number] = [255, 255, 255]
const TEXT_DARK: [number, number, number] = [30, 41, 59] // #1E293B Primary text
const TEXT_MUTED: [number, number, number] = [100, 116, 139] // #64748B Subtitle text
const ROW_BG_ALT: [number, number, number] = [248, 250, 252] // #F8FAFC Light row fill
const BORDER_COLOR: [number, number, number] = [226, 232, 240] // #E2E8F0 Border line

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const margin = 36 // 0.5 inch margin
  const contentW = pageW - margin * 2

  // ─── 1. TOP NAVY BRAND BANNER ───────────────────────────────────────────────
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 115, 'F')

  // Golden / Teal Accent Stripe underneath header
  doc.setFillColor(...TEAL)
  doc.rect(0, 115, pageW, 4, 'F')

  // Business Name (Left)
  const businessName = data.business?.name || 'MURLIDHAR OFFSET'
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(businessName.toUpperCase(), margin, 42)

  // Subtitle / Tagline
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(45, 212, 191) // Bright teal accent
  doc.text('COMMERCIAL OFFSET & DIGITAL PRINTING PRESS', margin, 56)

  // Business Address & Contact Info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225) // Light grey
  const bizAddr = data.business?.address || 'Shreeji Super Market, Shop No. 7, Unjha, Gujarat 384170'
  const bizContact = `Phone: +91 ${data.business?.phone || '9510737852'}  |  Email: ${data.business?.email || 'murlidharoffset84@gmail.com'}`
  doc.text(bizAddr, margin, 72)
  doc.text(bizContact, margin, 85)
  if (data.business?.gstin) {
    doc.text(`GSTIN: ${data.business.gstin}`, margin, 98)
  } else {
    doc.text('Web: www.murlidharoffset.com', margin, 98)
  }

  // Invoice Title & Ref (Right Side)
  doc.setTextColor(251, 191, 36) // Gold text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('TAX INVOICE', pageW - margin, 42, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('ORIGINAL FOR RECIPIENT', pageW - margin, 55, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...WHITE)
  const invoiceNum = data.orderNumber.startsWith('INV-') ? data.orderNumber : `INV-${data.orderNumber}`
  doc.text(`Invoice No: ${invoiceNum}`, pageW - margin, 72, { align: 'right' })

  const invDate = new Date(data.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  doc.text(`Invoice Date: ${invDate}`, pageW - margin, 85, { align: 'right' })
  doc.text(`Place of Supply: Gujarat (24)`, pageW - margin, 98, { align: 'right' })

  // ─── 2. BILL TO & ORDER INFO CARDS ──────────────────────────────────────────
  let y = 132

  // Card 1: Bill To (Left side)
  const card1W = 265
  const cardH = 88

  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(...ROW_BG_ALT)
  doc.roundedRect(margin, y, card1W, cardH, 4, 4, 'FD')

  // Inner Bill To Header
  doc.setFillColor(...NAVY)
  doc.roundedRect(margin, y, card1W, 20, 4, 4, 'F')
  // Fix square bottom corners for top header of card
  doc.rect(margin, y + 10, card1W, 10, 'F')

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('CUSTOMER / BILL TO', margin + 10, y + 13)

  // Customer Details
  doc.setTextColor(...TEXT_DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(data.customerName, margin + 10, y + 34)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)

  let cY = y + 47
  doc.text(`Phone: +91 ${data.phone}`, margin + 10, cY)
  cY += 12

  if (data.email) {
    doc.text(`Email: ${data.email}`, margin + 10, cY)
    cY += 12
  }

  const fullAddr = [data.address, data.city, data.state, data.pincode].filter(Boolean).join(', ')
  if (fullAddr) {
    const wrappedAddr = doc.splitTextToSize(fullAddr, card1W - 20)
    doc.text(wrappedAddr, margin + 10, cY)
  }

  // Card 2: Order Summary (Right side)
  const card2X = margin + card1W + 15
  const card2W = contentW - card1W - 15

  doc.setDrawColor(...BORDER_COLOR)
  doc.setFillColor(...ROW_BG_ALT)
  doc.roundedRect(card2X, y, card2W, cardH, 4, 4, 'FD')

  // Inner Order Details Header
  doc.setFillColor(...NAVY)
  doc.roundedRect(card2X, y, card2W, 20, 4, 4, 'F')
  doc.rect(card2X, y + 10, card2W, 10, 'F')

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('ORDER & PAYMENT SUMMARY', card2X + 10, y + 13)

  // Details inside Card 2
  doc.setFontSize(8)
  let oY = y + 34

  // Helper for row in card 2
  const drawMetaRow = (label: string, val: string, isBadge = false, badgeColor?: [number, number, number]) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...TEXT_MUTED)
    doc.text(label, card2X + 10, oY)

    if (isBadge && badgeColor) {
      doc.setFillColor(...badgeColor)
      doc.roundedRect(card2X + card2W - 85, oY - 9, 75, 13, 3, 3, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.text(val.toUpperCase(), card2X + card2W - 47.5, oY, { align: 'center' })
    } else {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT_DARK)
      doc.text(val, card2X + card2W - 10, oY, { align: 'right' })
    }
    oY += 16
  }

  drawMetaRow('Order Number:', `#${data.orderNumber}`)

  const isPaid = data.paymentStatus === 'paid'
  const payBadgeColor: [number, number, number] = isPaid ? [22, 101, 52] : [180, 83, 9]
  drawMetaRow('Payment Status:', data.paymentStatus, true, payBadgeColor)

  const payMethodText = data.paymentMethod === 'cod' ? 'Cash on Delivery' : data.paymentMethod === 'online' ? 'Razorpay Online' : data.paymentMethod.toUpperCase()
  drawMetaRow('Payment Mode:', payMethodText)

  // ─── 3. ITEMIZED PRODUCTS TABLE ─────────────────────────────────────────────
  y = 236

  // Table Columns Widths & Alignment
  const colIndexX = margin + 12
  const colDescX = margin + 35
  const colQtyX = margin + 310
  const colUnitX = margin + 400
  const colAmountX = margin + contentW - 10

  const tableHeaderH = 22

  // Draw Table Header Background
  doc.setFillColor(...NAVY)
  doc.rect(margin, y, contentW, tableHeaderH, 'F')

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('#', colIndexX, y + 14, { align: 'center' })
  doc.text('ITEM / SPECIFICATION', colDescX, y + 14)
  doc.text('QTY', colQtyX, y + 14, { align: 'center' })
  doc.text('RATE (₹)', colUnitX, y + 14, { align: 'right' })
  doc.text('AMOUNT (₹)', colAmountX, y + 14, { align: 'right' })

  y += tableHeaderH
  let isAltRow = false

  // Render Table Rows
  data.items.forEach((item, index) => {
    // Calculate required row height based on variant specs text length
    const hasSpecs = !!item.variantInfo
    const rowH = hasSpecs ? 32 : 24

    // Check if new page is required
    if (y + rowH > pageH - 170) {
      doc.addPage()
      y = margin + 30
      // Redraw Header on new page
      doc.setFillColor(...NAVY)
      doc.rect(margin, y, contentW, tableHeaderH, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.text('#', colIndexX, y + 14, { align: 'center' })
      doc.text('ITEM / SPECIFICATION', colDescX, y + 14)
      doc.text('QTY', colQtyX, y + 14, { align: 'center' })
      doc.text('RATE (₹)', colUnitX, y + 14, { align: 'right' })
      doc.text('AMOUNT (₹)', colAmountX, y + 14, { align: 'right' })
      y += tableHeaderH
    }

    // Row Background Fill
    if (isAltRow) {
      doc.setFillColor(...ROW_BG_ALT)
      doc.rect(margin, y, contentW, rowH, 'F')
    }
    isAltRow = !isAltRow

    // Row Border
    doc.setDrawColor(...BORDER_COLOR)
    doc.setLineWidth(0.5)
    doc.line(margin, y + rowH, margin + contentW, y + rowH)

    // Index
    doc.setTextColor(...TEXT_MUTED)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.text(String(index + 1), colIndexX, y + 15, { align: 'center' })

    // Product Name
    doc.setTextColor(...TEXT_DARK)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    const truncatedName = item.productName.length > 55 ? item.productName.substring(0, 52) + '...' : item.productName
    doc.text(truncatedName, colDescX, y + 14)

    // Variant / Specs Details
    if (hasSpecs) {
      doc.setFont('helvetica', 'oblique')
      doc.setFontSize(7.5)
      doc.setTextColor(...TEXT_MUTED)
      const truncatedSpecs = item.variantInfo!.length > 68 ? item.variantInfo!.substring(0, 65) + '...' : item.variantInfo!
      doc.text(`Specs: ${truncatedSpecs}`, colDescX, y + 25)
    }

    // Quantity
    doc.setTextColor(...TEXT_DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(String(item.qty), colQtyX, y + 14, { align: 'center' })

    // Unit Rate
    doc.text(formatCurrencyINR(item.unitPrice), colUnitX, y + 14, { align: 'right' })

    // Line Total
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(formatCurrencyINR(item.total), colAmountX, y + 14, { align: 'right' })

    y += rowH
  })

  // ─── 4. TOTALS & FINANCIAL SUMMARY ──────────────────────────────────────────
  y += 15

  // Ensure room for summary box
  if (y > pageH - 220) {
    doc.addPage()
    y = margin + 30
  }

  const summaryLeftW = 280
  const summaryRightX = margin + summaryLeftW + 15
  const summaryRightW = contentW - summaryLeftW - 15

  // Left Column: Customer Remarks / Note Box
  if (data.remarks) {
    doc.setDrawColor(...BORDER_COLOR)
    doc.setFillColor(...ROW_BG_ALT)
    doc.roundedRect(margin, y, summaryLeftW, 75, 4, 4, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...NAVY)
    doc.text('📝 CUSTOMER REMARKS / PRINT INSTRUCTIONS:', margin + 10, y + 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_DARK)
    const wrappedRemarks = doc.splitTextToSize(data.remarks, summaryLeftW - 20)
    doc.text(wrappedRemarks, margin + 10, y + 30)
  } else {
    // Payment Assurance Badge Box
    doc.setDrawColor(187, 247, 208)
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(margin, y, summaryLeftW, 60, 4, 4, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(22, 101, 52)
    doc.text('✓ Quality Guaranteed by Murlidhar Offset', margin + 10, y + 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(21, 128, 61)
    doc.text('Printed on high-precision offset & digital production presses.', margin + 10, y + 34)
    doc.text('For support or reorders, call +91 95107 37852.', margin + 10, y + 46)
  }

  // Right Column: Financial Calculation Box
  let rY = y
  const drawCalcRow = (label: string, valueStr: string, isBold = false, textColor: [number, number, number] = TEXT_DARK) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(label, summaryRightX, rY)

    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.setTextColor(...textColor)
    doc.text(valueStr, margin + contentW - 10, rY, { align: 'right' })
    rY += 14
  }

  drawCalcRow('Subtotal:', formatCurrencyINR(data.subtotal))

  if (data.discount && data.discount > 0) {
    drawCalcRow('Bulk Discount:', `-${formatCurrencyINR(data.discount)}`, true, [22, 101, 52])
  }

  drawCalcRow('Shipping / Delivery:', data.shipping === 0 ? 'FREE' : formatCurrencyINR(data.shipping), true, data.shipping === 0 ? [22, 101, 52] : TEXT_DARK)
  drawCalcRow('Taxes (GST):', 'Included', false, TEXT_MUTED)

  // Separator Line
  rY += 2
  doc.setDrawColor(...BORDER_COLOR)
  doc.line(summaryRightX, rY, margin + contentW, rY)
  rY += 8

  // Grand Total Banner
  const totalBoxH = 26
  doc.setFillColor(...NAVY)
  doc.roundedRect(summaryRightX - 5, rY, summaryRightW + 5, totalBoxH, 4, 4, 'F')

  doc.setTextColor(251, 191, 36) // Gold
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('GRAND TOTAL:', summaryRightX + 10, rY + 17)

  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(formatCurrencyINR(data.total), margin + contentW - 10, rY + 17, { align: 'right' })

  // Amount in Words
  rY += totalBoxH + 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text(`Amount in Words: `, summaryRightX, rY)
  doc.setFont('helvetica', 'oblique')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  const amountWords = numberToWordsINR(data.total)
  doc.text(amountWords, summaryRightX + doc.getTextWidth('Amount in Words: '), rY)

  // ─── 5. TERMS & CONDITIONS AND AUTHORIZED SIGNATURE ───────────────────────
  let bY = pageH - 125

  // Horizontal divider
  doc.setDrawColor(...BORDER_COLOR)
  doc.setLineWidth(0.75)
  doc.line(margin, bY, margin + contentW, bY)

  bY += 14

  // Terms & Conditions (Left)
  const termsW = 320
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('TERMS & CONDITIONS:', margin, bY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  const terms = [
    '1. All orders printed as per customer approved artwork/proof.',
    '2. Goods once sold or printed cannot be returned or exchanged.',
    '3. All legal disputes subject to Unjha (Gujarat) jurisdiction.',
  ]
  terms.forEach((t, i) => {
    doc.text(t, margin, bY + 12 + i * 10)
  })

  // Authorized Signatory (Right)
  const sigX = margin + contentW - 140
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY)
  doc.text(`For ${businessName}`, sigX, bY, { align: 'left' })

  // Digital Signature Line
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.5)
  doc.line(sigX, bY + 36, margin + contentW, bY + 36)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Authorized Signatory', sigX + 25, bY + 46)

  // ─── 6. FOOTER BAR ────────────────────────────────────────────────────────
  const footerY = pageH - 30
  doc.setFillColor(...ROW_BG_ALT)
  doc.rect(0, footerY - 10, pageW, 40, 'F')
  doc.setDrawColor(...BORDER_COLOR)
  doc.line(0, footerY - 10, pageW, footerY - 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...NAVY)
  doc.text('Thank you for your business! We print your dreams on paper.', pageW / 2, footerY + 4, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('This is a computer-generated tax invoice and requires no physical signature.', pageW / 2, footerY + 16, { align: 'center' })

  return doc
}

/**
 * Format currency with Indian Rupee Symbol (₹)
 */
function formatCurrencyINR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `Rs. ${formatted}`
}

/**
 * Convert number to Indian Rupee Words (e.g. 5400 -> Five Thousand Four Hundred Rupees Only)
 */
function numberToWordsINR(amount: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ]
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const num = Math.floor(amount)
  if (num === 0) return 'Zero Rupees Only'

  const inWords = (n: number): string => {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '')
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '')
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '')
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '')
  }

  return `${inWords(num).trim()} Rupees Only`
}

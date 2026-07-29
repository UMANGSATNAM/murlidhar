'use client'

import * as React from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateInvoicePDF, InvoiceData } from '@/lib/invoice'
import { toast as sonnerToast } from 'sonner'

export function InvoiceDownloadButton({
  order,
  variant = 'default',
  className = '',
  label = 'Download Invoice',
}: {
  order: InvoiceData
  variant?: 'default' | 'outline' | 'gold'
  className?: string
  label?: string
}) {
  const [loading, setLoading] = React.useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // Small delay to show loading state
      await new Promise((r) => setTimeout(r, 200))
      const doc = generateInvoicePDF(order)
      doc.save(`Invoice-${order.orderNumber}.pdf`)
      sonnerToast.success('Invoice downloaded')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed to generate invoice')
    } finally {
      setLoading(false)
    }
  }

  const variantClass =
    variant === 'outline'
      ? 'border-navy text-navy hover:bg-background hover:text-foreground'
      : variant === 'gold'
      ? 'bg-gold text-navy hover:bg-gold-deep hover:text-foreground'
      : 'bg-background text-foreground hover:bg-secondary/30'

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className={`${variantClass} ${className}`}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  )
}

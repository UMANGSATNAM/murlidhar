'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Package, Truck, CheckCircle2, Clock, AlertCircle, Loader2,
  MapPin, Calendar, IndianRupee, ChevronRight, FileText, MessageSquare,
  ArrowRight, Phone, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { InvoiceDownloadButton } from '@/components/storefront/invoice-button'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface OrderItem {
  id: string; productName: string; variantInfo?: string | null
  qty: number; unitPrice: number; total: number
}
interface OrderFile {
  id: string; fileName: string; filePath: string; fileSize: number
}
interface Order {
  id: string; orderNumber: string; customerName: string; phone: string; email?: string
  address?: string; city?: string; state?: string; pincode?: string
  remarks?: string
  subtotal: number; shipping: number; total: number
  paymentMethod: string; paymentStatus: string
  orderStatus: string; statusNote?: string | null; statusHistory?: string | null
  createdAt: string; updatedAt: string
  items: OrderItem[]; files: OrderFile[]
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'production', label: 'In Production', icon: Package },
  { key: 'ready', label: 'Ready for Dispatch', icon: CheckCircle2 },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

export default function TrackPage() {
  return (
    <StorefrontShell>
      <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center py-20 text-navy font-display text-lg font-bold animate-pulse">Loading tracking...</div>}>
        <TrackContent />
      </React.Suspense>
    </StorefrontShell>
  )
}

function TrackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = React.useState('')
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)
  const [error, setError] = React.useState('')

  const performSearch = React.useCallback(async (q: string) => {
    if (!q) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(q)}?by=orderNumber`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Order not found')
        setOrder(null)
      } else {
        setOrder(data.order)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-search if `?o=` is present in URL (e.g. from checkout confirmation)
  React.useEffect(() => {
    const o = searchParams.get('o')
    if (o) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrderNumber(o)
      performSearch(o)
    }
  }, [searchParams, performSearch])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = orderNumber.trim()
    if (!q) {
      sonnerToast.error('Please enter your order number')
      return
    }
    performSearch(q)
  }

  // Determine current step index for status tracker
  const currentStepIdx = order
    ? STATUS_STEPS.findIndex((s) => s.key === order.orderStatus)
    : -1

  return (
    <>
      <section className="bg-gradient-to-b from-background to-secondary/20 py-14 text-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Order Tracking</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            Track Your <span className="text-gold-gradient">Order</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">Enter your order number to see real-time status updates.</p>
        </div>
              </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card className="card-premium overflow-hidden">
          <div className="bg-secondary/40 px-6 py-4 border-b border-border">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Search className="h-5 w-5 text-gold" /> Enter Order Number
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              You'll find this in your order confirmation email or SMS. Example: MO260716-5687
            </p>
          </div>
          <form onSubmit={handleSearch} className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. MO260716-5687"
                  className="pl-10 border-border text-base"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Track Order
              </Button>
            </div>
          </form>
        </Card>

        {/* Loading state */}
        {loading && (
          <Card className="mt-6 p-10 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Looking up your order...</p>
          </Card>
        )}

        {/* Error state */}
        {searched && !loading && error && (
          <Card className="mt-6 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-3 font-display text-xl font-bold text-navy">Order not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <div className="mt-4 rounded-md bg-secondary/40 p-3 text-xs text-muted-foreground">
              <p>Double-check your order number — it should look like <code className="rounded bg-white px-1.5 py-0.5 text-navy">MO260716-5687</code>.</p>
              <p className="mt-2">Need help? Call us at <a href="tel:9510737852" className="font-semibold text-gold-deep">9510737852</a>.</p>
            </div>
          </Card>
        )}

        {/* Order found */}
        {order && !loading && (
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status tracker */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-b from-background to-secondary/20 p-5 text-foreground">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Order Number</p>
                    <p className="font-display text-2xl font-bold text-gold">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Placed on</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              {order.orderStatus === 'cancelled' ? (
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <h3 className="mt-3 font-display text-xl font-bold text-red-600">Order Cancelled</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This order has been cancelled. Please contact us for assistance.
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="relative">
                    {/* Progress line */}
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
                    <div
                      className="absolute left-0 top-5 h-0.5 bg-gold transition-all duration-700"
                      style={{ width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {STATUS_STEPS.map((step, i) => {
                        const completed = i <= currentStepIdx
                        const Icon = step.icon
                        return (
                          <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                completed
                                  ? 'border-gold bg-gold text-navy shadow-gold'
                                  : 'border-border bg-white text-muted-foreground'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className={`text-center text-[10px] font-medium sm:text-xs ${completed ? 'text-navy' : 'text-muted-foreground'}`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {order.statusNote && (
                    <div className="mt-6 rounded-lg border border-gold/30 bg-gold/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold-deep">Note from Murlidhar Offset</p>
                      <p className="mt-1 text-sm text-foreground/80">{order.statusNote}</p>
                    </div>
                  )}

                  {/* Status history timeline */}
                  {(() => {
                    let history: { status: string; note?: string; timestamp: string }[] = []
                    try { history = order.statusHistory ? JSON.parse(order.statusHistory) : [] } catch {}
                    if (history.length === 0) return null
                    return (
                      <div className="mt-6">
                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Status History</p>
                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                          <div className="space-y-3">
                            {history.map((entry, i) => (
                              <div key={i} className="relative flex items-start gap-3">
                                <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-white">
                                  <span className="h-2 w-2 rounded-full bg-gold" />
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-navy capitalize">{entry.status}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {entry.note && <p className="text-xs text-foreground/70">{entry.note}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </Card>

            {/* Order details grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer + delivery */}
              <Card className="overflow-hidden">
                <div className="border-b border-border bg-secondary/40 px-5 py-3">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                    <MapPin className="h-4 w-4 text-gold" /> Delivery Details
                  </h3>
                </div>
                <div className="space-y-2 p-5 text-sm">
                  <p className="font-semibold text-navy">{order.customerName}</p>
                  <p className="text-muted-foreground">{order.phone}</p>
                  {order.email && <p className="text-muted-foreground">{order.email}</p>}
                  {order.address && (
                    <p className="text-muted-foreground">
                      {order.address}{order.city ? `, ${order.city}` : ''}{order.state ? `, ${order.state}` : ''}{order.pincode ? ` - ${order.pincode}` : ''}
                    </p>
                  )}
                </div>
              </Card>

              {/* Payment */}
              <Card className="overflow-hidden">
                <div className="border-b border-border bg-secondary/40 px-5 py-3">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                    <IndianRupee className="h-4 w-4 text-gold" /> Payment
                  </h3>
                </div>
                <div className="space-y-2 p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-semibold text-navy uppercase">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-semibold uppercase ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-semibold text-navy">Total</span>
                    <span className="font-display text-lg font-bold text-navy">{formatINR(order.total)}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Items */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-secondary/40 px-5 py-3">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <Package className="h-4 w-4 text-gold" /> Items ({order.items.length})
                </h3>
              </div>
              <div className="divide-y divide-border">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy">{it.productName}</p>
                      {it.variantInfo && <p className="text-xs text-muted-foreground">{it.variantInfo}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {it.qty} × {formatINR(it.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold text-navy">{formatINR(it.total)}</p>
                  </div>
                ))}
                <div className="bg-secondary/30 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatINR(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2">
                    <span className="font-display font-bold text-navy">Total</span>
                    <span className="font-display text-xl font-bold text-navy">{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Files + remarks */}
            {(order.files.length > 0 || order.remarks) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {order.files.length > 0 && (
                  <Card className="overflow-hidden">
                    <div className="border-b border-border bg-secondary/40 px-5 py-3">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                        <FileText className="h-4 w-4 text-gold" /> Design Files ({order.files.length})
                      </h3>
                    </div>
                    <ul className="divide-y divide-border">
                      {order.files.map((f) => (
                        <li key={f.id} className="flex items-center justify-between gap-2 p-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-gold" />
                            <span className="truncate text-sm text-navy">{f.fileName}</span>
                          </div>
                          <a href={f.filePath} download={f.fileName} className="shrink-0 text-xs font-semibold text-gold-deep hover:underline">
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {order.remarks && (
                  <Card className="overflow-hidden">
                    <div className="border-b border-border bg-secondary/40 px-5 py-3">
                      <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                        <MessageSquare className="h-4 w-4 text-gold" /> Your Remarks
                      </h3>
                    </div>
                    <p className="whitespace-pre-line p-4 text-sm text-foreground/80">{order.remarks}</p>
                  </Card>
                )}
              </div>
            )}

            {/* Help CTA */}
            <Card className="bg-gradient-to-b from-background to-secondary/20 p-6 text-center text-foreground">
              <h3 className="font-display text-xl font-bold">Need help with your order?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Our team is available 24 hours — call us anytime.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <a href="tel:9510737852" className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-soft">
                  <Phone className="h-4 w-4" /> Call 9510737852
                </a>
                <a href="https://wa.me/919510737852" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cream/30 px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-cream/10">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <InvoiceDownloadButton
                  order={order}
                  variant="outline"
                  label="Download Invoice"
                  className="border-cream/30 bg-cream/10 text-foreground hover:bg-cream hover:text-navy"
                />
              </div>
            </Card>

            <div className="text-center">
              <Button asChild variant="outline" className="border-navy text-navy">
                <Link href="/shop">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty state — before search */}
        {!searched && !loading && (
          <div className="mt-10 text-center">
            <MandalaLogo size={96} className="mx-auto opacity-30" />
            <p className="mt-4 text-sm text-muted-foreground">
              Your order status will appear here once you enter your order number.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

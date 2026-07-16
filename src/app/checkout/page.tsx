'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, ArrowRight, ArrowLeft, Upload, X, FileCheck2, Loader2,
  ShieldCheck, CreditCard, Banknote, Store, MessageSquare, CheckCircle2, Phone, Mail, MapPin, Printer,
  Package, MessageCircle, FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { InvoiceDownloadButton } from '@/components/storefront/invoice-button'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

export default function CheckoutPage() {
  return (
    <StorefrontShell>
      <CheckoutContent />
    </StorefrontShell>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const clear = useCart((s) => s.clear)
  const subtotal = useCart((s) => s.items.reduce((a, i) => a + i.qty * i.unitPrice, 0))
  const total = subtotal

  const [form, setForm] = React.useState({
    customerName: '', phone: '', email: '', address: '', city: '', state: 'Gujarat', pincode: '',
  })
  const [remarks, setRemarks] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState('cod')
  const [files, setFiles] = React.useState<{ name: string; url: string; size: number }[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [placedOrder, setPlacedOrder] = React.useState<{ orderNumber: string; total: number; fullOrder?: any } | null>(null)

  // Settings for payment options
  const [settings, setSettings] = React.useState<any>(null)
  React.useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then(setSettings)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(fileList).forEach((f) => fd.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFiles((prev) => [...prev, ...data.files])
      sonnerToast.success(`Uploaded ${data.files.length} file(s)`)
    } catch (err: any) {
      sonnerToast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customerName || !form.phone) {
      sonnerToast.error('Name and phone are required')
      return
    }
    if (items.length === 0) {
      sonnerToast.error('Your cart is empty')
      return
    }
    setSubmitting(true)
    try {
      // Aggregate per-item files & remarks from cart (we only have global ones here)
      const orderItems = items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        variantId: i.variantId,
        variantLabel: i.variantLabel,
        qty: i.qty,
        unitPrice: i.unitPrice,
      }))
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          remarks,
          items: orderItems,
          paymentMethod,
          files: files.map((f) => ({ name: f.name, url: f.url, size: f.size })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')
      setPlacedOrder({ orderNumber: data.order.orderNumber, total: data.order.total, fullOrder: data.order })
      clear()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      sonnerToast.error(err.message || 'Order placement failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Order Placed Confirmation ────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="card-premium overflow-hidden text-center">
          <div className="bg-navy-gradient p-8 text-cream">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gold/20">
              <CheckCircle2 className="h-12 w-12 text-gold" />
            </div>
            <h1 className="font-display text-3xl font-bold text-cream">Order Placed!</h1>
            <p className="mt-2 text-sm text-cream/70">Thank you for your order. We've received your request and will begin production shortly.</p>
          </div>
          <div className="p-6">
            <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Order Number</p>
              <p className="font-display text-2xl font-bold text-navy">{placedOrder.orderNumber}</p>
            </div>
            <div className="mt-4 flex justify-between border-b border-border pb-4">
              <span className="text-sm text-muted-foreground">Order Total</span>
              <span className="font-display text-xl font-bold text-navy">{formatINR(placedOrder.total)}</span>
            </div>
            <div className="mt-4 rounded-lg bg-cream/60 p-4 text-left text-sm">
              <p className="font-semibold text-navy">What happens next?</p>
              <ul className="mt-2 space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  We'll review your order & uploaded files
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  Our team will call you to confirm details & payment
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  You'll receive email updates at each stage
                </li>
              </ul>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild className="flex-1 bg-navy text-cream hover:bg-navy-soft">
                <Link href="/shop">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-navy text-navy">
                <Link href={`/track?o=${placedOrder.orderNumber}`}>
                  <Package className="mr-2 h-4 w-4" /> Track Order
                </Link>
              </Button>
              <InvoiceDownloadButton
                order={placedOrder.fullOrder}
                variant="outline"
                label="Download Invoice"
                className="flex-1 border-gold text-gold-deep hover:bg-gold hover:text-navy"
              />
              <Button asChild variant="outline" className="flex-1 border-green-600 text-green-700 hover:bg-green-600 hover:text-white">
                <a
                  href={`https://wa.me/919510737852?text=${encodeURIComponent(`Hi Murlidhar Offset, I just placed order *${placedOrder.orderNumber}* for ${formatINR(placedOrder.total)}. Please confirm receipt.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Save your order number: <strong className="text-navy">{placedOrder.orderNumber}</strong>
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center">
        <MandalaLogo size={120} />
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add some products before checking out.</p>
        </div>
        <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-cream">
          <Link href="/shop">Browse Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <section className="bg-navy-gradient py-10 text-cream">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-xs text-cream/60">
            <Link href="/" className="hover:text-gold">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-gold">Cart</Link>
            <span>/</span>
            <span className="text-gold">Checkout</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Secure Checkout
          </h1>
        </div>
        <MandalaDivider className="mt-6 opacity-60" />
      </section>

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left — form */}
          <div className="space-y-6">
            {/* Customer details */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-cream">1</span>
                  Your Details
                </h2>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" required value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1 border-border" placeholder="Prince Patel" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 border-border" placeholder="9510737852" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 border-border" placeholder="you@example.com" />
                </div>
              </div>
            </Card>

            {/* Delivery address */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-cream">2</span>
                  Delivery Address
                </h2>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Textarea id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 resize-none border-border" rows={2} placeholder="House/Shop no, area, landmark" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 border-border" placeholder="Unjha" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 border-border" placeholder="Gujarat" />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1 border-border" placeholder="384170" />
                </div>
              </div>
            </Card>

            {/* File upload */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-cream">3</span>
                  Upload Design Files
                  <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Optional</span>
                </h2>
              </div>
              <div className="p-5">
                <p className="mb-3 text-xs text-muted-foreground">
                  Upload your artwork files for this order. Accepted: .cdr, .jpg, .jpeg, .png, .ps, .pdf · Max 50MB per file
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition hover:border-gold hover:bg-gold/5">
                  {uploading ? (
                    <><Loader2 className="h-6 w-6 animate-spin text-gold" /><span className="text-sm text-muted-foreground">Uploading...</span></>
                  ) : (
                    <><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-sm font-medium text-navy">Click to upload files</span><span className="text-xs text-muted-foreground">or drag and drop here</span></>
                  )}
                  <input type="file" multiple accept=".cdr,.jpg,.jpeg,.png,.ps,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 rounded-md border border-border bg-cream/40 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <FileCheck2 className="h-4 w-4 shrink-0 text-gold" />
                          <span className="truncate text-sm text-navy">{f.name}</span>
                          <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            {/* Remarks */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-cream">4</span>
                  Additional Instructions
                </h2>
              </div>
              <div className="p-5">
                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Anything special we should know? Paper preference, colour matching, finishing, deadline, etc." className="resize-none border-border" />
              </div>
            </Card>

            {/* Payment */}
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-cream/60 px-5 py-3">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs text-cream">5</span>
                  Payment Method
                </h2>
              </div>
              <div className="p-5">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  {settings?.onlineEnabled !== false && (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${paymentMethod === 'online' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                      <RadioGroupItem value="online" id="pay-online" />
                      <CreditCard className="h-5 w-5 text-navy" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy">Online Payment</p>
                        <p className="text-xs text-muted-foreground">Pay via UPI / Cards / Net Banking (Razorpay)</p>
                      </div>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Recommended</span>
                    </label>
                  )}
                  {settings?.codEnabled !== false && (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${paymentMethod === 'cod' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                      <RadioGroupItem value="cod" id="pay-cod" />
                      <Banknote className="h-5 w-5 text-navy" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay in cash when your order arrives</p>
                      </div>
                    </label>
                  )}
                  {settings?.payAtShopEnabled !== false && (
                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition ${paymentMethod === 'payatshop' ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'}`}>
                      <RadioGroupItem value="payatshop" id="pay-shop" />
                      <Store className="h-5 w-5 text-navy" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-navy">Pay at Shop</p>
                        <p className="text-xs text-muted-foreground">Pick up & pay at our Unjha shop</p>
                      </div>
                    </label>
                  )}
                </RadioGroup>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 100% secure payment. We'll never share your details.
                </p>
              </div>
            </Card>
          </div>

          {/* Right — order summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="card-premium overflow-hidden">
              <div className="bg-navy-gradient p-5 text-cream">
                <h2 className="font-display text-lg font-bold">Order Summary</h2>
                <p className="text-xs text-cream/60">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
              </div>
              <div className="max-h-72 overflow-y-auto scroll-elegant p-4">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 border-b border-border py-2.5 last:border-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      {item.image ? (
                         
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><Printer className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-navy">{item.productName}</p>
                      {item.variantLabel && <p className="line-clamp-1 text-xs text-muted-foreground">{item.variantLabel}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">Qty: {item.qty} × {formatINR(item.unitPrice)}</p>
                    </div>
                    <p className="text-sm font-bold text-navy">{formatINR(item.qty * item.unitPrice)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-t border-border p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-navy">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-display text-base font-bold text-navy">Total</span>
                  <span className="font-display text-2xl font-bold text-navy">{formatINR(total)}</span>
                </div>
                <Button type="submit" size="lg" className="mt-2 w-full bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={submitting}>
                  {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>) : (<>Place Order <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
                <Button asChild type="button" variant="ghost" size="sm" className="w-full text-navy">
                  <Link href="/cart"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart</Link>
                </Button>
              </div>
            </Card>

            <div className="mt-4 space-y-2 rounded-xl border border-border bg-white p-4 text-xs">
              <p className="font-bold text-navy">Need help with your order?</p>
              <a href="tel:9510737852" className="flex items-center gap-2 text-muted-foreground hover:text-navy">
                <Phone className="h-3.5 w-3.5 text-gold" /> 9510737852
              </a>
              <a href="mailto:murlidharoffset84@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-navy">
                <Mail className="h-3.5 w-3.5 text-gold" /> murlidharoffset84@gmail.com
              </a>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-gold" /> Shreeji Super Market, Unjha
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

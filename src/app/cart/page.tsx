'use client'

import * as React from 'react'
import Link from 'next/link'
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft, Upload, X, FileCheck2, MessageSquare, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

export default function CartPage() {
  return (
    <StorefrontShell>
      <CartContent />
    </StorefrontShell>
  )
}

function CartContent() {
  const items = useCart((s) => s.items)
  const removeItem = useCart((s) => s.removeItem)
  const updateQty = useCart((s) => s.updateQty)
  const clear = useCart((s) => s.clear)
  const subtotal = useCart((s) => s.items.reduce((a, i) => a + i.qty * i.unitPrice, 0))

  // Per-item remarks + files
  const [remarksMap, setRemarksMap] = React.useState<Record<string, string>>({})
  const [filesMap, setFilesMap] = React.useState<Record<string, { name: string; url: string; size: number }[]>>({})
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null)

  const handleUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    setUploadingKey(key)
    try {
      const formData = new FormData()
      Array.from(fileList).forEach((f) => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFilesMap((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...data.files],
      }))
      sonnerToast.success(`Uploaded ${data.files.length} file(s)`)
    } catch (err: any) {
      sonnerToast.error(err.message || 'Upload failed')
    } finally {
      setUploadingKey(null)
      e.target.value = ''
    }
  }

  const shipping = subtotal > 0 ? 0 : 0
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20 text-center">
        <MandalaLogo size={120} />
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Looks like you haven't added any products yet. Explore our premium printing services and find the perfect fit.
          </p>
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
            <span className="text-gold">Cart</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <MandalaDivider className="mt-6 opacity-60" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.key} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-secondary sm:h-28 sm:w-28"
                  >
                    {item.image ? (
                       
                      <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link href={`/product/${item.slug}`} className="font-display text-base font-bold text-navy hover:text-gold-deep">
                          {item.productName}
                        </Link>
                        {item.variantLabel && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          className="flex h-8 w-8 items-center justify-center text-navy hover:bg-secondary"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          className="flex h-8 w-8 items-center justify-center text-navy hover:bg-secondary"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatINR(item.unitPrice)} each</p>
                        <p className="font-display text-lg font-bold text-navy">{formatINR(item.qty * item.unitPrice)}</p>
                      </div>
                    </div>

                    {/* Per-item remarks + files (collapsible) */}
                    <details className="mt-3 group">
                      <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-gold-deep hover:underline">
                        <MessageSquare className="h-3 w-3" />
                        Add remarks / upload design file for this item
                        {(remarksMap[item.key] || (filesMap[item.key]?.length)) && (
                          <span className="ml-1 rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold-deep">
                            {(remarksMap[item.key] ? 1 : 0) + (filesMap[item.key]?.length || 0)} added
                          </span>
                        )}
                      </summary>
                      <div className="mt-2 space-y-2 rounded-md border border-border bg-cream/40 p-3">
                        <Textarea
                          value={remarksMap[item.key] || ''}
                          onChange={(e) => setRemarksMap((m) => ({ ...m, [item.key]: e.target.value }))}
                          placeholder="Special instructions for this item (paper, colour, finishing, etc.)"
                          rows={2}
                          className="resize-none border-border bg-white text-sm"
                        />
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:border-gold">
                          {uploadingKey === item.key ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="h-3 w-3" /> Upload design file (.cdr/.jpg/.png/.ps/.pdf)</>
                          )}
                          <input
                            type="file"
                            multiple
                            accept=".cdr,.jpg,.jpeg,.png,.ps,.pdf"
                            className="hidden"
                            onChange={(e) => handleUpload(item.key, e)}
                            disabled={uploadingKey === item.key}
                          />
                        </label>
                        {filesMap[item.key]?.length > 0 && (
                          <ul className="space-y-1">
                            {filesMap[item.key].map((f, i) => (
                              <li key={i} className="flex items-center justify-between gap-2 text-xs">
                                <span className="flex min-w-0 items-center gap-1.5">
                                  <FileCheck2 className="h-3 w-3 shrink-0 text-gold" />
                                  <span className="truncate text-navy">{f.name}</span>
                                </span>
                                <button
                                  onClick={() => setFilesMap((prev) => ({ ...prev, [item.key]: prev[item.key].filter((_, idx) => idx !== i) }))}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex justify-between">
              <Button asChild variant="ghost" className="text-navy">
                <Link href="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  clear()
                  sonnerToast.success('Cart cleared')
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="card-premium overflow-hidden">
              <div className="bg-navy-gradient p-5 text-cream">
                <h2 className="font-display text-lg font-bold">Order Summary</h2>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-navy">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-muted-foreground">Included</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-base font-bold text-navy">Total</span>
                    <span className="font-display text-2xl font-bold text-navy">{formatINR(total)}</span>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg bg-cream/60 p-3 text-xs">
                  <div className="flex items-center gap-2 text-navy">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" /> 100% secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-navy">
                    <Truck className="h-3.5 w-3.5 text-gold" /> Free local delivery in Unjha
                  </div>
                </div>

                <Button asChild size="lg" className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-cream">
                  <Link href="/checkout">Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Pay online (Razorpay), Cash on Delivery, or Pay at Shop
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  GitCompare, X, Star, ShoppingBag, ArrowRight, Printer, Clock, Package,
  CheckCircle2, ArrowLeft, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell, StarRating } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'
import { useCompare } from '@/lib/compare-store'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

export default function ComparePage() {
  return (
    <StorefrontShell>
      <CompareContent />
    </StorefrontShell>
  )
}

function CompareContent() {
  const router = useRouter()
  const items = useCompare((s) => s.items)
  const remove = useCompare((s) => s.remove)
  const clear = useCompare((s) => s.clear)
  const addItem = useCart((s) => s.addItem)

  const handleAddToCart = (item: typeof items[0]) => {
    addItem({
      key: `${item.productId}-compare-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      slug: item.slug,
      image: item.image,
      qty: 1,
      unitPrice: item.basePrice,
    })
    sonnerToast.success(`Added ${item.name} to cart`)
  }

  return (
    <>
      <section className="bg-gradient-to-b from-background to-secondary/20 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-teal">Home</Link>
            <span>/</span>
            <span className="text-teal">Compare</span>
          </div>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            <GitCompare className="h-8 w-8 text-gold" />
            Compare Products
          </h1>
          <p className="mt-2 text-sm text-white/70">
            {items.length > 0
              ? `Side-by-side comparison of ${items.length} ${items.length === 1 ? 'product' : 'products'}`
              : 'Add products to compare them side-by-side'}
          </p>
        </div>
              </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <GitCompare className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-4 font-display text-2xl font-bold text-navy">No products to compare yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse our shop and click the compare icon on any product to add it here.
              You can compare up to 3 products side-by-side.
            </p>
            <Button asChild className="mt-6 bg-gold text-navy hover:bg-gold-deep hover:text-white">
              <Link href="/shop">
                Browse Shop <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        ) : (
          <>
            {/* Top action bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Button asChild variant="ghost" className="text-navy">
                <Link href="/shop"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link>
              </Button>
              <Button variant="ghost" onClick={() => { clear(); sonnerToast.success('Compare cleared') }} className="text-destructive hover:text-destructive">
                <X className="mr-2 h-4 w-4" /> Clear All
              </Button>
            </div>

            {/* Comparison table — horizontal scroll on mobile */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto scroll-elegant">
                <table className="w-full border-collapse">
                  <tbody>
                    {/* Header row — product images + names */}
                    <tr>
                      <td className="sticky left-0 z-10 w-32 bg-secondary/40 p-4 align-bottom">
                        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Product</span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="min-w-[220px] border-l border-border p-4 align-top">
                          <div className="relative">
                            <button
                              onClick={() => { remove(item.productId); sonnerToast.success('Removed from compare') }}
                              className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background text-white shadow hover:bg-destructive"
                              aria-label="Remove"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <Link href={`/product/${item.slug}`} className="group block">
                              <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
                                {item.image ? (
                                   
                                  <Image src={item.image} alt={item.name} fill sizes="220px" className="object-cover transition group-hover:scale-105" />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Printer className="h-12 w-12 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <h3 className="mt-3 font-display text-sm font-bold leading-snug text-navy group-hover:text-teal line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Price */}
                    <tr className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                          <span className="h-3 w-3 rounded-full bg-gold" /> Starting Price
                        </span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <p className="font-display text-lg font-bold text-navy">{formatINR(item.basePrice)}</p>
                        </td>
                      ))}
                    </tr>

                    {/* Rating */}
                    <tr className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                          <Star className="h-3 w-3 fill-teal text-teal" /> Rating
                        </span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <StarRating rating={item.rating} count={item.reviewCount} size={14} />
                        </td>
                      ))}
                    </tr>

                    {/* Category */}
                    <tr className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                          <Package className="h-3 w-3 text-gold" /> Category
                        </span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-navy">
                            {item.category || '—'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Turnaround */}
                    <tr className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                          <Clock className="h-3 w-3 text-gold" /> Turnaround
                        </span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <span className="text-sm text-foreground/80">{item.turnaroundNote || 'Contact us'}</span>
                        </td>
                      ))}
                    </tr>

                    {/* Short description */}
                    <tr className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-gold" /> Description
                        </span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <p className="text-xs leading-relaxed text-foreground/70">
                            {item.shortDesc || 'No description available'}
                          </p>
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr className="border-t border-border bg-secondary/20">
                      <td className="sticky left-0 z-10 bg-secondary/40 p-4">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Actions</span>
                      </td>
                      {items.map((item) => (
                        <td key={item.productId} className="border-l border-border p-4">
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleAddToCart(item)}
                              size="sm"
                              className="bg-gold text-navy hover:bg-gold-deep hover:text-white"
                            >
                              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
                            </Button>
                            <Button asChild size="sm" variant="outline" className="border-navy text-navy">
                              <Link href={`/product/${item.slug}`}>View Details</Link>
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Hint to add more */}
            {items.length < 3 && (
              <div className="mt-6 rounded-lg border border-dashed border-gold/40 bg-gold/5 p-4 text-center">
                <p className="text-sm text-navy">
                  <GitCompare className="mr-1.5 inline h-4 w-4 text-gold" />
                  You can compare {3 - items.length} more {3 - items.length === 1 ? 'product' : 'products'}.{' '}
                  <Link href="/shop" className="font-semibold text-gold-deep hover:underline">
                    Add more from shop →
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

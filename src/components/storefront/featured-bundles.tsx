'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, Plus, ArrowRight, Percent, Package } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/storefront/section-bits'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface BundleProduct {
  id: string; name: string; slug: string; basePrice: number
  images: { url: string }[]
}
interface BundleItem {
  id: string; productId: string; qty: number; product: BundleProduct
}
interface Bundle {
  id: string; name: string; slug: string; description?: string
  originalPrice: number; bundlePrice: number; savings: number
  items: BundleItem[]
}

export function FeaturedBundles() {
  const [bundles, setBundles] = React.useState<Bundle[]>([])
  const addItem = useCart((s) => s.addItem)

  React.useEffect(() => {
    fetch('/api/bundles?featured=true').then((r) => r.json()).then((d) => setBundles(d.items || []))
  }, [])

  if (bundles.length === 0) return null

  const handleAddBundle = (bundle: Bundle) => {
    bundle.items.forEach((it) => {
      addItem({
        key: `bundle-${bundle.id}-${it.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: it.productId,
        productName: it.product.name,
        slug: it.product.slug,
        image: it.product.images[0]?.url,
        qty: it.qty,
        unitPrice: it.product.basePrice,
        bundleId: bundle.id,
        bundleName: bundle.name,
      })
    })
    sonnerToast.success(`Added "${bundle.name}" bundle to cart!`)
  }

  return (
    <>
            <section className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Save More"
            title="Combo Deals & Bundles"
            subtitle="Buy together and save. Our curated bundles give you everything you need at a discounted price."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => {
              const savingsPct = b.originalPrice > 0 ? Math.round((b.savings / b.originalPrice) * 100) : 0
              return (
                <Card key={b.id} className="group overflow-hidden border-gold/30 transition-all hover:-translate-y-1 hover:shadow-navy">
                  {/* Header */}
                  <div className="relative bg-gradient-to-b from-background to-secondary/20 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase text-navy">
                        <Tag className="h-3 w-3" /> Combo Deal
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Percent className="h-3 w-3" /> {savingsPct}% OFF
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">{b.name}</h3>
                    {b.description && <p className="mt-1 text-xs text-white/70 line-clamp-2">{b.description}</p>}
                  </div>

                  {/* Items */}
                  <div className="p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Includes:</p>
                    <ul className="space-y-1.5">
                      {b.items.map((it) => (
                        <li key={it.id} className="flex items-center gap-2 text-sm">
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                            {it.product.images[0]?.url ? (
                               
                              <Image src={it.product.images[0].url} alt={it.product.name} fill className="object-cover" sizes="32px" />
                            ) : (
                              <div className="flex h-full items-center justify-center"><Package className="h-3 w-3 text-muted-foreground/40" /></div>
                            )}
                          </div>
                          <span className="flex-1 truncate text-navy">{it.product.name}</span>
                          <span className="text-xs text-muted-foreground">×{it.qty}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Pricing */}
                    <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-xs text-muted-foreground line-through">{formatINR(b.originalPrice)}</p>
                        <p className="font-display text-2xl font-bold text-navy">{formatINR(b.bundlePrice)}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        Save {formatINR(b.savings)}
                      </span>
                    </div>

                    <Button
                      onClick={() => handleAddBundle(b)}
                      className="mt-3 w-full bg-gold text-navy hover:bg-gold-deep hover:text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Bundle to Cart
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

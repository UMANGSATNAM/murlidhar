'use client'

import * as React from 'react'
import Link from 'next/link'
import { Clock, ArrowRight, Printer, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'
import { useRecentlyViewed } from '@/lib/recently-viewed-store'
import { formatINR } from '@/lib/format'

export function RecentlyViewed({ excludeProductId }: { excludeProductId?: string }) {
  const items = useRecentlyViewed((s) => s.items)
  const clear = useRecentlyViewed((s) => s.clear)

  // Filter out the current product + only show items with valid slugs
  const visible = items.filter((i) => i.productId !== excludeProductId).slice(0, 4)

  if (visible.length === 0) return null

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between gap-3">
          <SectionHeader
            eyebrow="Pick up where you left off"
            title="Recently Viewed"
            center={false}
          />
          <button
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Clear
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => (
            <Link
              key={item.productId}
              href={`/product/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-1 hover:shadow-navy"
            >
              <div className="relative aspect-square overflow-hidden bg-secondary">
                {item.image ? (
                   
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Printer className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-navy/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-cream backdrop-blur">
                  <Clock className="mr-1 inline h-2.5 w-2.5" />
                  {timeAgo(item.viewedAt)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="font-display text-sm font-bold leading-snug text-navy line-clamp-2">{item.name}</h3>
                <p className="mt-2 font-display text-base font-bold text-navy">{formatINR(item.basePrice)}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-gold-deep">
                  View again <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

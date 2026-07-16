'use client'

import * as React from 'react'
import { TrendingDown, CheckCircle2, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'

interface Tier {
  id: string
  minQty: number
  discountPct: number
  active: boolean
}

export function BulkDiscountBanner() {
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.items.reduce((a, i) => a + i.qty * i.unitPrice, 0))
  const [tiers, setTiers] = React.useState<Tier[]>([])

  React.useEffect(() => {
    fetch('/api/bulk-tiers').then((r) => r.json()).then((d) => setTiers(d.items || []))
  }, [])

  if (tiers.length === 0) return null

  const totalQty = items.reduce((s, i) => s + i.qty, 0)

  // Find current applicable tier
  const currentTier = [...tiers].reverse().find((t) => totalQty >= t.minQty) || null
  // Find next tier to reach
  const nextTier = tiers.find((t) => totalQty < t.minQty) || null

  // If max tier reached
  const maxTier = tiers[tiers.length - 1]
  const maxReached = currentTier && (!nextTier || currentTier.minQty >= maxTier.minQty)

  // Calculate potential savings
  const potentialSavings = nextTier
    ? Math.round(subtotal * (nextTier.discountPct / 100) * 100) / 100
    : 0
  const currentSavings = currentTier
    ? Math.round(subtotal * (currentTier.discountPct / 100) * 100) / 100
    : 0

  // Progress to next tier
  const progress = (() => {
    if (!nextTier) return 100
    const prevMin = currentTier?.minQty || 0
    const range = nextTier.minQty - prevMin
    const done = totalQty - prevMin
    return Math.min(100, Math.max(0, (done / range) * 100))
  })()

  return (
    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${currentTier ? 'bg-green-100' : 'bg-gold/20'}`}>
          {currentTier ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-gold-deep" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {currentTier ? (
            <>
              <p className="text-sm font-bold text-navy">
                🎉 You unlocked {currentTier.discountPct}% bulk discount!
              </p>
              <p className="text-xs text-muted-foreground">
                Saving <strong className="text-green-600">{formatINR(currentSavings)}</strong> on this order ({totalQty} units)
              </p>
            </>
          ) : nextTier ? (
            <>
              <p className="text-sm font-bold text-navy">
                Add {nextTier.minQty - totalQty} more to unlock {nextTier.discountPct}% off
              </p>
              <p className="text-xs text-muted-foreground">
                You have {totalQty} units · next tier at {nextTier.minQty} (save {formatINR(potentialSavings)})
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-navy">Bulk discounts available</p>
          )}

          {/* Progress bar */}
          {nextTier && (
            <div className="mt-2">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{currentTier ? `${currentTier.minQty}+` : '0'}</span>
                <span>{nextTier.minQty}+ → {nextTier.discountPct}% off</span>
              </div>
            </div>
          )}

          {/* All tiers preview */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tiers.map((t) => {
              const reached = totalQty >= t.minQty
              const isCurrent = currentTier?.id === t.id
              return (
                <span
                  key={t.id}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-green-500 text-white'
                      : reached
                      ? 'bg-green-100 text-green-700'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {t.minQty}+ → {t.discountPct}%
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

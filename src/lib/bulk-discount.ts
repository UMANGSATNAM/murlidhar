import { db } from '@/lib/db'

export interface BulkTier {
  id: string
  minQty: number
  discountPct: number
  active: boolean
}

export async function getActiveBulkTiers(): Promise<BulkTier[]> {
  const tiers = await db.bulkDiscountTier.findMany({
    where: { active: true },
    orderBy: { minQty: 'asc' },
  })
  return tiers
}

// Returns the best applicable discount tier for a given total quantity
export function getApplicableTier(totalQty: number, tiers: BulkTier[]): BulkTier | null {
  let best: BulkTier | null = null
  for (const t of tiers) {
    if (totalQty >= t.minQty) {
      if (!best || t.discountPct > best.discountPct) best = t
    }
  }
  return best
}

// Apply bulk discount to a subtotal based on total item quantity
export function applyBulkDiscount(
  subtotal: number,
  totalQty: number,
  tiers: BulkTier[]
): { tier: BulkTier | null; discountAmount: number; finalSubtotal: number } {
  const tier = getApplicableTier(totalQty, tiers)
  if (!tier) return { tier: null, discountAmount: 0, finalSubtotal: subtotal }
  const discountAmount = Math.round(subtotal * (tier.discountPct / 100) * 100) / 100
  return {
    tier,
    discountAmount,
    finalSubtotal: Math.max(0, subtotal - discountAmount),
  }
}

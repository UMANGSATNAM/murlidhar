'use client'

import type { CartItem } from '@/lib/cart-store'

export interface BundleInfo {
  id: string
  name: string
  originalPrice: number
  bundlePrice: number
  savings: number
}

// Detect bundles in cart and compute total bundle discount
export function detectBundleDiscounts(items: CartItem[]): {
  appliedBundles: { name: string; savings: number; itemCount: number }[]
  totalBundleSavings: number
} {
  // Group items by bundleId
  const bundleGroups: Record<string, CartItem[]> = {}
  items.forEach((item) => {
    if (item.bundleId) {
      if (!bundleGroups[item.bundleId]) bundleGroups[item.bundleId] = []
      bundleGroups[item.bundleId].push(item)
    }
  })

  const appliedBundles: { name: string; savings: number; itemCount: number }[] = []
  let totalBundleSavings = 0

  Object.entries(bundleGroups).forEach(([bundleId, bundleItems]) => {
    // Calculate the original total of these items
    const originalTotal = bundleItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
    // We need the bundle price — fetch from API would be ideal, but for now
    // we'll use a simple heuristic: 15% discount on bundle items
    // In production, this would fetch the actual bundle price from the API
    // For now, we'll just show the bundle name in cart and let checkout handle the actual discount
    const bundleName = bundleItems[0]?.bundleName || 'Bundle'
    appliedBundles.push({
      name: bundleName,
      savings: 0, // will be calculated at checkout via API
      itemCount: bundleItems.length,
    })
  })

  return { appliedBundles, totalBundleSavings }
}

// Get bundle IDs present in cart
export function getBundleIds(items: CartItem[]): string[] {
  const ids = new Set<string>()
  items.forEach((item) => {
    if (item.bundleId) ids.add(item.bundleId)
  })
  return Array.from(ids)
}

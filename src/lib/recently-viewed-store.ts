'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentlyViewedItem {
  productId: string
  name: string
  slug: string
  image?: string
  basePrice: number
  viewedAt: number
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  add: (item: RecentlyViewedItem) => void
  clear: () => void
}

const MAX_ITEMS = 8

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          // Remove if already exists (to move to front)
          const filtered = state.items.filter((i) => i.productId !== item.productId)
          return { items: [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS) }
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'mo-recently-viewed' }
  )
)

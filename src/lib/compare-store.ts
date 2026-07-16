'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CompareItem {
  productId: string
  name: string
  slug: string
  image?: string
  basePrice: number
  rating: number
  reviewCount: number
  category?: string
  shortDesc?: string
  turnaroundNote?: string
}

interface CompareState {
  items: CompareItem[]
  isOpen: boolean
  toggle: (item: CompareItem) => void
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
  setOpen: (open: boolean) => void
  count: () => number
}

const MAX_COMPARE = 3

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toggle: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.productId === item.productId)
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== item.productId) }
          }
          if (state.items.length >= MAX_COMPARE) {
            return state // max reached, do nothing
          }
          return { items: [...state.items, item] }
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      count: () => get().items.length,
    }),
    { name: 'mo-compare' }
  )
)

export const MAX_COMPARE_ITEMS = MAX_COMPARE

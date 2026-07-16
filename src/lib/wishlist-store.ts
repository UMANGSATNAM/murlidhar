'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  slug: string
  image?: string
  basePrice: number
  addedAt: number
}

interface WishlistState {
  items: WishlistItem[]
  isOpen: boolean
  toggle: (item: WishlistItem) => void
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
  setOpen: (open: boolean) => void
  count: () => number
}

export const useWishlist = create<WishlistState>()(
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
          return { items: [...state.items, { ...item, addedAt: Date.now() }] }
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      has: (productId) => get().items.some((i) => i.productId === productId),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      count: () => get().items.length,
    }),
    { name: 'mo-wishlist' }
  )
)

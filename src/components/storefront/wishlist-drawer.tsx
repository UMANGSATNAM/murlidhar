'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, X, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useWishlist } from '@/lib/wishlist-store'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

export function WishlistDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const items = useWishlist((s) => s.items)
  const remove = useWishlist((s) => s.remove)
  const toggle = useWishlist((s) => s.toggle)
  const addItem = useCart((s) => s.addItem)

  const moveToCart = (item: typeof items[0]) => {
    addItem({
      key: `${item.productId}-default-wishlist-${Date.now()}`,
      productId: item.productId,
      productName: item.name,
      slug: item.slug,
      image: item.image,
      qty: 1,
      unitPrice: item.basePrice,
    })
    remove(item.productId)
    sonnerToast.success(`Moved ${item.name} to cart`)
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream p-0 flex flex-col">
          <SheetHeader className="border-b border-gold/30 bg-background px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Heart className="h-5 w-5 text-gold" />
              Wishlist
              <span className="text-xs font-normal text-muted-foreground">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <Heart className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-display text-lg text-navy">Your wishlist is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save your favourite printing products here for later.
                </p>
              </div>
              <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground">
                <Link href="/shop" onClick={() => setOpen(false)}>
                  Browse Shop <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto scroll-elegant px-4 py-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 border-b border-border/60 py-3 last:border-0"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-white"
                    >
                      {item.image ? (
                         
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-secondary">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-1 text-sm font-semibold text-navy hover:text-teal"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 font-display text-base font-bold text-navy">
                        {formatINR(item.basePrice)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => moveToCart(item)}
                          className="h-7 bg-gold px-2 text-xs text-navy hover:bg-gold-deep hover:text-foreground"
                        >
                          <ShoppingCart className="mr-1 h-3 w-3" /> Add to Cart
                        </Button>
                        <button
                          onClick={() => { remove(item.productId); sonnerToast.success('Removed from wishlist') }}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/30 bg-white px-5 py-4">
                <Button asChild className="w-full bg-background text-foreground hover:bg-secondary/30">
                  <Link href="/shop" onClick={() => setOpen(false)}>
                    Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <button
                  onClick={() => {
                    if (confirm('Clear all items from your wishlist?')) {
                      items.forEach((i) => toggle(i))
                      sonnerToast.success('Wishlist cleared')
                    }
                  }}
                  className="mt-2 w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear wishlist
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

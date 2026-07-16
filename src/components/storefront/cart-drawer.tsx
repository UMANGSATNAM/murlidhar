'use client'

import * as React from 'react'
import Link from 'next/link'
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { MandalaLogo } from './mandala-logo'
import Image from 'next/image'

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const items = useCart((s) => s.items)
  const removeItem = useCart((s) => s.removeItem)
  const updateQty = useCart((s) => s.updateQty)
  const subtotal = useCart((s) => s.items.reduce((a, i) => a + i.qty * i.unitPrice, 0))

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-cream p-0 flex flex-col">
          <SheetHeader className="border-b border-gold/30 bg-navy px-5 py-4">
            <SheetTitle className="flex items-center justify-between text-cream">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold" />
                Your Cart
                <span className="text-xs font-normal text-cream/60">({items.length} items)</span>
              </span>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <MandalaLogo size={80} />
              <div>
                <p className="font-display text-lg text-navy">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore our premium printing services and add your favourites.
                </p>
              </div>
              <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-cream">
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
                    key={item.key}
                    className="flex gap-3 border-b border-border/60 py-3 last:border-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                      {item.image ? (
                         
                        <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-1 text-sm font-semibold text-navy hover:text-gold-deep"
                      >
                        {item.productName}
                      </Link>
                      {item.variantLabel && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {item.variantLabel}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-border">
                          <button
                            onClick={() => updateQty(item.key, item.qty - 1)}
                            className="flex h-7 w-7 items-center justify-center text-navy hover:bg-secondary"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.key, item.qty + 1)}
                            className="flex h-7 w-7 items-center justify-center text-navy hover:bg-secondary"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-navy">
                          {formatINR(item.qty * item.unitPrice)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/30 bg-white px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold text-navy">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Shipping & taxes calculated at checkout. COD & online payment available.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy hover:text-cream">
                    <Link href="/cart" onClick={() => setOpen(false)}>View Cart</Link>
                  </Button>
                  <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-cream">
                    <Link href="/checkout" onClick={() => setOpen(false)}>
                      Checkout <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

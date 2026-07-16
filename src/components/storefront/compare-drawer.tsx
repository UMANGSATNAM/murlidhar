'use client'

import * as React from 'react'
import Link from 'next/link'
import { GitCompare, X, ArrowRight, Trash2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCompare, MAX_COMPARE_ITEMS } from '@/lib/compare-store'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

export function CompareDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const items = useCompare((s) => s.items)
  const remove = useCompare((s) => s.remove)
  const clear = useCompare((s) => s.clear)

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-white p-0 flex flex-col">
          <SheetHeader className="border-b border-gold/30 bg-navy px-5 py-4">
            <SheetTitle className="flex items-center gap-2 text-white">
              <GitCompare className="h-5 w-5 text-gold" />
              Compare Products
              <span className="text-xs font-normal text-white/60">
                ({items.length}/{MAX_COMPARE_ITEMS})
              </span>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <GitCompare className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-display text-lg text-navy">No products to compare</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add up to {MAX_COMPARE_ITEMS} products here to compare them side-by-side.
                </p>
              </div>
              <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-white">
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
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-secondary"
                    >
                      {item.image ? (
                         
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-secondary">
                          <Printer className="h-6 w-6 text-muted-foreground" />
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
                      {item.category && (
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      )}
                      <p className="mt-1 font-display text-base font-bold text-navy">
                        {formatINR(item.basePrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => { remove(item.productId); sonnerToast.success('Removed from compare') }}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label="Remove from compare"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/30 bg-white px-5 py-4 space-y-2">
                <Button asChild className="w-full bg-navy text-white hover:bg-navy-soft" disabled={items.length < 2}>
                  <Link href="/compare" onClick={() => setOpen(false)}>
                    <GitCompare className="mr-2 h-4 w-4" /> Compare {items.length} {items.length === 1 ? 'product' : 'products'}
                  </Link>
                </Button>
                {items.length < 2 && (
                  <p className="text-center text-[11px] text-muted-foreground">
                    Add at least 2 products to compare
                  </p>
                )}
                <button
                  onClick={() => { clear(); sonnerToast.success('Compare cleared') }}
                  className="w-full text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

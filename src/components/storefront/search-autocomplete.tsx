'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Package, ArrowRight, Folder } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatINR } from '@/lib/format'

interface SearchProduct {
  id: string; name: string; slug: string; basePrice: number
  images: { url: string }[]; category?: { name: string }
}
interface SearchCategory {
  id: string; name: string; slug: string; icon?: string
}

export function SearchAutocomplete() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState('')
  const [products, setProducts] = React.useState<SearchProduct[]>([])
  const [categories, setCategories] = React.useState<SearchCategory[]>([])
  const [loading, setLoading] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  React.useEffect(() => {
    if (q.trim().length < 2) {
      setProducts([])
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => {
          setProducts(d.items || [])
          setCategories(d.categories || [])
        })
        .finally(() => setLoading(false))
    }, 200) // debounce
    return () => clearTimeout(t)
  }, [q])

  const hasResults = products.length > 0 || categories.length > 0

  const submit = () => {
    if (q.trim()) {
      router.push(`/shop?q=${encodeURIComponent(q.trim())}`)
      setOpen(false)
      setQ('')
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Search visiting cards, brochures..."
          className="w-full pl-10 pr-8 border-border bg-white"
          aria-label="Search products"
        />
        {q && (
          <button
            onClick={() => { setQ(''); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-white shadow-xl sm:w-96">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-gold" /> Searching...
            </div>
          ) : !hasResults ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No results for "{q}"</p>
              <button
                onClick={submit}
                className="mt-2 text-xs font-semibold text-gold-deep hover:underline"
              >
                Browse all products →
              </button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto scroll-elegant">
              {categories.length > 0 && (
                <div className="border-b border-border bg-cream/40 px-3 py-2">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Categories</p>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/shop?category=${c.slug}`}
                      onClick={() => { setOpen(false); setQ('') }}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-navy hover:bg-white"
                    >
                      <Folder className="h-3.5 w-3.5 text-gold" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              <div className="p-2">
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Products</p>
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => { setOpen(false); setQ('') }}
                    className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-cream/60"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary">
                      {p.images[0]?.url ? (
                         
                        <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><Package className="h-4 w-4 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-navy group-hover:text-gold-deep">{p.name}</p>
                      {p.category && <p className="text-xs text-muted-foreground">{p.category.name}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-navy">{formatINR(p.basePrice)}</span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-border bg-cream/40 p-2">
                <button
                  onClick={submit}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gold-deep hover:bg-white"
                >
                  See all results for "{q}" <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

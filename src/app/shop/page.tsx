'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, X, Search, Printer, ArrowRight, Package, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { StorefrontShell, StarRating } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'
import { formatINR } from '@/lib/format'

interface Category { id: string; name: string; slug: string; icon?: string; _count?: { products: number } }
interface Product {
  id: string; name: string; slug: string; shortDesc?: string
  basePrice: number; rating: number; reviewCount: number
  images: { url: string; alt?: string }[]
  category?: { name: string; slug: string }
}

const CATEGORY_ICONS: Record<string, any> = {
  CreditCard: 'CreditCard', FileText: 'FileText', Mail: 'Mail',
  Newspaper: 'Newspaper', BookOpen: 'BookOpen', Folder: 'Folder',
}

export default function ShopPage() {
  return (
    <StorefrontShell>
      <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center py-20 text-navy font-display text-lg font-bold animate-pulse">Loading shop...</div>}>
        <ShopContent />
      </React.Suspense>
    </StorefrontShell>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [categories, setCategories] = React.useState<Category[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(true)
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 25000])

  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'newest'

  React.useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((c) => setCategories(c.items || []))
  }, [])

  React.useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (q) params.set('q', q)
    if (sort) params.set('sort', sort)
    params.set('page', String(page))
    params.set('pageSize', '12')
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]))
    if (priceRange[1] < 25000) params.set('maxPrice', String(priceRange[1]))
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.items || [])
        setTotal(d.total || 0)
        setTotalPages(d.totalPages || 1)
        setLoading(false)
      })
  }, [category, q, sort, page, priceRange])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value); else params.delete(key)
    params.delete('page')
    setPage(1)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-background to-secondary/20 py-12 text-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-accent font-medium">Home</Link>
            <span>/</span>
            <span className="text-accent font-semibold">Shop</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">
            Shop Our Print Catalogue
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Premium printing services for every need. Select a product, choose your variant, upload your design file, and we'll handle the rest.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* ─── Desktop Filter Sidebar ──────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <FilterPanel
              categories={categories}
              selectedCategory={category}
              onCategoryChange={(slug) => setParam('category', slug)}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              sort={sort}
              onSortChange={(s) => setParam('sort', s)}
            />
          </aside>

          {/* ─── Products Grid ────────────────────────────────────────────────── */}
          <div>
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white shadow-sm p-4">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-navy">
                  Showing <span className="font-bold">{products.length}</span> of{' '}
                  <span className="font-bold">{total}</span> products
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden border-border text-foreground hover:bg-secondary">
                      <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] bg-background p-0">
                    <SheetHeader className="border-b border-border bg-muted/50 px-5 py-4">
                      <SheetTitle className="text-foreground">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="p-4">
                      <FilterPanel
                        categories={categories}
                        selectedCategory={category}
                        onCategoryChange={(slug) => setParam('category', slug)}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        sort={sort}
                        onSortChange={(s) => setParam('sort', s)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <select
                  value={sort}
                  onChange={(e) => setParam('sort', e.target.value)}
                  className="h-9 rounded-md border border-border bg-white px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active filter chips */}
            {(category || q) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {category && (
                  <button
                    onClick={() => setParam('category', '')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {categories.find((c) => c.slug === category)?.name || category}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {q && (
                  <button
                    onClick={() => setParam('q', '')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground"
                  >
                    Search: "{q}" <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                    <div className="aspect-square animate-pulse bg-secondary" />
                    <div className="p-4">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
                      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-secondary" />
                      <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-white py-20 text-center shadow-sm">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-display text-lg font-bold text-navy">No products found</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or browse all products.</p>
                </div>
                <Button asChild className="bg-amber-500 text-white hover:bg-amber-600 rounded-lg">
                  <Link href="/shop">Clear Filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, totalPages) }).map((_, i) => {
                    let p = i + 1
                    if (totalPages > 7) {
                      if (page > 4) p = page - 3 + i
                      if (page > totalPages - 3) p = totalPages - 6 + i
                    }
                    if (p < 1 || p > totalPages) return null
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-9 w-9 rounded-md text-sm font-medium transition ${
                          p === page
                            ? 'bg-foreground text-background'
                            : 'border border-border bg-white text-foreground hover:bg-secondary'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sort,
  onSortChange,
}: {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (slug: string) => void
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
  sort: string
  onSortChange: (s: string) => void
}) {
  const pricePresets = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500–₹1,000', min: 500, max: 1000 },
    { label: '₹1,000–₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000+', min: 5000, max: 25000 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-accent" /> Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
              !selectedCategory ? 'bg-background text-foreground' : 'text-foreground/70 hover:bg-secondary'
            }`}
          >
            All Products
            <span className="text-xs opacity-70">
              {categories.reduce((s, c) => s + (c._count?.products ?? 0), 0)}
            </span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.slug)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                selectedCategory === c.slug ? 'bg-background text-foreground' : 'text-foreground/70 hover:bg-secondary'
              }`}
            >
              {c.name}
              <span className="text-xs opacity-70">{c._count?.products ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">Price Range</h3>
        <div className="space-y-3">
          <Slider
            value={priceRange}
            onValueChange={(v) => onPriceChange([v[0], v[1]] as [number, number])}
            min={0}
            max={25000}
            step={500}
            className="py-2"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="rounded bg-secondary px-2 py-1 font-medium text-foreground">{formatINR(priceRange[0])}</span>
            <span className="text-muted-foreground">to</span>
            <span className="rounded bg-secondary px-2 py-1 font-medium text-foreground">{formatINR(priceRange[1])}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pricePresets.map((p) => {
              const active = priceRange[0] === p.min && priceRange[1] === p.max
              return (
                <button
                  key={p.label}
                  onClick={() => onPriceChange([p.min, p.max])}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                    active
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border bg-white text-muted-foreground hover:border-accent/50 hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-foreground">Sort By</h3>
        <div className="space-y-1">
          {[
            { value: 'newest', label: 'Newest First' },
            { value: 'name', label: 'Name (A–Z)' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                sort === opt.value ? 'bg-secondary font-semibold text-foreground' : 'text-foreground/70 hover:bg-secondary'
              }`}
            >
              {sort === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-cream p-5 shadow-sm">
        <p className="font-display text-base font-bold text-navy">Need help choosing?</p>
        <p className="mt-1 text-xs text-muted-foreground">Our team will guide you to the right product for your need.</p>
        <Button asChild size="sm" className="mt-4 w-full rounded-lg bg-amber-500 text-white hover:bg-amber-600">
          <a href="tel:9510737852">Call 9510737852</a>
        </Button>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]?.url
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary border-b border-border">
        {img ? (
           
          <Image
            src={img}
            alt={product.images?.[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Printer className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy backdrop-blur shadow-sm">
            {product.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold leading-snug text-navy line-clamp-2">{product.name}</h3>
        {product.shortDesc && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.shortDesc}</p>
        )}
        <div className="mt-2"><StarRating rating={product.rating} count={product.reviewCount} size={13} /></div>
        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gold-deep">Starting from</p>
            <p className="font-display text-xl font-bold text-navy">{formatINR(product.basePrice)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-3 py-1.5 text-xs font-bold text-navy transition group-hover:bg-amber-500 group-hover:text-white">
            View <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

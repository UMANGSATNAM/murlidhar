'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Zap,
  Upload,
  FileCheck2,
  X,
  Plus,
  Minus,
  Star,
  Printer,
  Truck,
  ShieldCheck,
  Clock,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StorefrontShell, StarRating } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { useCart } from '@/lib/cart-store'
import { formatINR } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { toast as sonnerToast } from 'sonner'

interface VariantOption { id: string; value: string; order: number }
interface VariantAttribute { id: string; name: string; order: number; options: VariantOption[] }
interface Variant {
  id: string
  price: number
  sku?: string
  stock: number
  options: { option: { id: string; value: string; attribute?: { name: string } } }[]
}
interface Product {
  id: string
  name: string
  slug: string
  shortDesc?: string
  description?: string
  basePrice: number
  rating: number
  reviewCount: number
  turnaroundNote?: string
  category?: { name: string; slug: string }
  images: { url: string; alt?: string; order: number }[]
  attributes: VariantAttribute[]
  variants: Variant[]
}
interface Related {
  id: string; name: string; slug: string; basePrice: number; rating: number; reviewCount: number
  images: { url: string }[]
}

export default function ProductDetailPage() {
  return (
    <StorefrontShell>
      <ProductDetailContent />
    </StorefrontShell>
  )
}

function ProductDetailContent() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const addItem = useCart((s) => s.addItem)

  const [product, setProduct] = React.useState<Product | null>(null)
  const [related, setRelated] = React.useState<Related[]>([])
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)

  const [activeImage, setActiveImage] = React.useState(0)
  const [selection, setSelection] = React.useState<Record<string, string>>({})
  const [qty, setQty] = React.useState(1)
  const [remarks, setRemarks] = React.useState('')
  const [files, setFiles] = React.useState<{ name: string; url: string; size: number }[]>([])
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (!slug) return
    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        setProduct(d.product)
        setRelated(d.related || [])
        // Pre-select first option of each attribute
        const init: Record<string, string> = {}
        d.product.attributes.forEach((a: VariantAttribute) => {
          if (a.options[0]) init[a.name] = a.options[0].value
        })
        setSelection(init)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Find matching variant for current selection
  const matchedVariant = React.useMemo(() => {
    if (!product) return null
    return product.variants.find((v) => {
      return v.options.every((vo) => {
        const attrName = vo.option.attribute?.name
        return attrName && selection[attrName] === vo.option.value
      })
    }) || null
  }, [product, selection])

  const currentPrice = matchedVariant?.price ?? product?.basePrice ?? 0

  // ─── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(fileList).forEach((f) => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFiles((prev) => [...prev, ...data.files])
      sonnerToast.success(`Uploaded ${data.files.length} file(s)`)
    } catch (err: any) {
      sonnerToast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  // ─── Add to cart ───────────────────────────────────────────────────────────
  const buildCartItem = () => {
    if (!product) return null
    if (product.attributes.length > 0 && !matchedVariant) return null
    const variantLabel = product.attributes
      .map((a) => selection[a.name])
      .filter(Boolean)
      .join(' · ')
    return {
      key: `${product.id}-${matchedVariant?.id || 'default'}`,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.images[0]?.url,
      variantId: matchedVariant?.id,
      variantLabel: variantLabel || undefined,
      qty,
      unitPrice: currentPrice,
      remarks: remarks || undefined,
      files: files.length ? files : undefined,
    }
  }

  const handleAddToCart = () => {
    const item = buildCartItem()
    if (!item) {
      sonnerToast.error('Please select all variant options')
      return
    }
    addItem(item)
    sonnerToast.success(`Added ${qty} × ${product?.name} to cart`)
  }

  const handleOrderNow = () => {
    const item = buildCartItem()
    if (!item) {
      sonnerToast.error('Please select all variant options')
      return
    }
    addItem(item)
    router.push('/checkout')
  }

  // ─── Loading / Not Found ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-secondary" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
            <div className="h-10 w-1/3 animate-pulse rounded bg-secondary" />
            <div className="h-24 w-full animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </div>
    )
  }
  if (notFound || !product) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <Printer className="h-16 w-16 text-muted-foreground/40" />
        <h1 className="font-display text-2xl font-bold text-navy">Product not found</h1>
        <p className="text-sm text-muted-foreground">This product may have been removed or is no longer available.</p>
        <Button asChild className="bg-navy text-cream hover:bg-navy-soft">
          <Link href="/shop">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-navy">Shop</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-navy">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-navy">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ─── Left: Image gallery ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-border bg-white shadow-sm">
              {product.images[activeImage] ? (
                <div className="relative h-full w-full overflow-hidden">
                  { }
                  <img
                    src={product.images[activeImage].url}
                    alt={product.images[activeImage].alt || product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Printer className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
              {product.category && (
                <span className="absolute left-4 top-4 rounded-full bg-navy/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                  {product.category.name}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scroll-elegant pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage ? 'border-gold' : 'border-border hover:border-gold/50'
                    }`}
                  >
                    { }
                    <img src={img.url} alt={img.alt || `Image ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-border bg-white p-3 text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="text-[10px] font-medium text-navy">Premium Quality</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-border">
                <Clock className="h-5 w-5 text-gold" />
                <span className="text-[10px] font-medium text-navy">On-Time Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-5 w-5 text-gold" />
                <span className="text-[10px] font-medium text-navy">{product.turnaroundNote || 'Fast Turnaround'}</span>
              </div>
            </div>
          </div>

          {/* ─── Right: Product info ─────────────────────────────────────────── */}
          <div>
            <h1 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={product.rating} count={product.reviewCount} size={16} />
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">In stock · Ready to ship</span>
            </div>

            {product.shortDesc && (
              <p className="mt-4 text-base leading-relaxed text-foreground/80">{product.shortDesc}</p>
            )}

            {/* Price block */}
            <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-deep">Your Price</p>
                  <p className="font-display text-3xl font-bold text-navy">{formatINR(currentPrice * qty)}</p>
                  <p className="text-xs text-muted-foreground">{formatINR(currentPrice)} per unit · incl. all taxes</p>
                </div>
                {product.variants.length > 1 && (
                  <span className="rounded-full bg-navy px-3 py-1 text-[10px] font-semibold text-cream">
                    {product.variants.length} variants
                  </span>
                )}
              </div>
            </div>

            {/* Variant dropdowns */}
            {product.attributes.length > 0 && (
              <div className="mt-6 space-y-4">
                {product.attributes.map((attr) => (
                  <div key={attr.id}>
                    <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy">
                      {attr.name} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selection[attr.name] || ''}
                      onValueChange={(v) => setSelection((s) => ({ ...s, [attr.name]: v }))}
                    >
                      <SelectTrigger className="w-full border-border bg-white focus:ring-gold">
                        <SelectValue placeholder={`Select ${attr.name}`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {attr.options.map((opt) => (
                          <SelectItem key={opt.id} value={opt.value}>
                            {opt.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {product.attributes.length > 0 && !matchedVariant && (
                  <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    This combination is not available. Please choose another option.
                  </p>
                )}
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-lg border border-border bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center text-navy hover:bg-secondary"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-10 w-14 border-x border-border bg-transparent text-center text-sm font-semibold focus:outline-none"
                />
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center text-navy hover:bg-secondary"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                size="lg"
                variant="outline"
                className="flex-1 border-navy text-navy hover:bg-navy hover:text-cream"
                disabled={!matchedVariant && product.attributes.length > 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
              <Button
                onClick={handleOrderNow}
                size="lg"
                className="flex-1 bg-gold text-navy hover:bg-gold-deep hover:text-cream"
                disabled={!matchedVariant && product.attributes.length > 0}
              >
                <Zap className="mr-2 h-4 w-4" /> Order Now
              </Button>
            </div>

            {/* File upload */}
            <div className="mt-6 rounded-xl border border-border bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4 text-gold" />
                <Label className="text-sm font-bold text-navy">Upload Your Design File</Label>
                <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Optional</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Accepted formats: .cdr, .jpg, .jpeg, .png, .ps, .pdf · Max 50MB per file
              </p>

              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition hover:border-gold hover:bg-gold/5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-navy">Click to upload files</span>
                    <span className="text-xs text-muted-foreground">or drag and drop here</span>
                  </>
                )}
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".cdr,.jpg,.jpeg,.png,.ps,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-md border border-border bg-cream/40 px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileCheck2 className="h-4 w-4 shrink-0 text-gold" />
                        <span className="truncate text-sm text-navy">{f.name}</span>
                        <span className="text-xs text-muted-foreground">({(f.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Remarks */}
            <div className="mt-4 rounded-xl border border-border bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gold" />
                <Label htmlFor="remarks" className="text-sm font-bold text-navy">Additional Instructions / Remarks</Label>
              </div>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Tell us anything specific about your order — paper preference, colour match, finishing, delivery deadline, etc."
                rows={3}
                className="resize-none border-border bg-white focus:ring-gold"
              />
            </div>

            {/* Turnaround note */}
            {product.turnaroundNote && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-navy/5 px-4 py-3 text-sm">
                <Clock className="h-4 w-4 text-gold-deep" />
                <span className="font-medium text-navy">{product.turnaroundNote}</span>
              </div>
            )}

            {/* Full description */}
            {product.description && (
              <div className="mt-6 border-t border-border pt-6">
                <h2 className="font-display text-lg font-bold text-navy">Product Details</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                  {product.description}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span>Files & remarks can also be added later at checkout.</span>
            </div>
          </div>
        </div>

        {/* ─── Related Products ───────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <MandalaDivider className="mb-10" />
            <SectionHeader eyebrow="You May Also Like" title="Related Products" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-1 hover:shadow-navy"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary">
                    {p.images[0]?.url ? (
                       
                      <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Printer className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-display text-sm font-bold leading-snug text-navy line-clamp-2">{p.name}</h3>
                    <div className="mt-2"><StarRating rating={p.rating} count={p.reviewCount} size={12} /></div>
                    <p className="mt-2 font-display text-base font-bold text-navy">{formatINR(p.basePrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </>
  )
}

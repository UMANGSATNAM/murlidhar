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
  Heart,
  Share2,
  MessageCircle,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StorefrontShell, StarRating } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { ImageLightbox } from '@/components/storefront/image-lightbox'
import { RecentlyViewed } from '@/components/storefront/recently-viewed'
import { ProductFAQ } from '@/components/storefront/product-faq'
import { useCart } from '@/lib/cart-store'
import { useWishlist } from '@/lib/wishlist-store'
import { useRecentlyViewed } from '@/lib/recently-viewed-store'
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
interface ProductReview {
  id: string; name: string; email?: string | null; rating: number
  title?: string | null; comment: string; createdAt: string
}

export default function ProductDetailClient() {
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
  const wishlistHas = useWishlist((s) => s.has)
  const wishlistToggle = useWishlist((s) => s.toggle)
  const addRecentlyViewed = useRecentlyViewed((s) => s.add)

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

  // Reviews
  const [reviews, setReviews] = React.useState<ProductReview[]>([])
  const [reviewsAvg, setReviewsAvg] = React.useState(0)
  const [reviewsCount, setReviewsCount] = React.useState(0)
  const [reviewOpen, setReviewOpen] = React.useState(false)
  const [reviewForm, setReviewForm] = React.useState({ name: '', email: '', rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = React.useState(false)

  // Hover-zoom
  const [zoom, setZoom] = React.useState({ active: false, x: 50, y: 50 })
  const imgRef = React.useRef<HTMLDivElement>(null)

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoom({ active: true, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

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

  // Fetch reviews when product id is available
  React.useEffect(() => {
    if (!product) return
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.items || [])
        setReviewsAvg(d.average || 0)
        setReviewsCount(d.count || 0)
      })
      .catch(() => {})
  }, [product])

  // Track recently viewed
  React.useEffect(() => {
    if (!product) return
    addRecentlyViewed({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url,
      basePrice: product.basePrice,
      viewedAt: Date.now(),
    })
  }, [product, addRecentlyViewed])

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

  // ─── Wishlist ──────────────────────────────────────────────────────────────
  const handleToggleWishlist = () => {
    if (!product) return
    wishlistToggle({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url,
      basePrice: currentPrice,
    })
    sonnerToast.success(
      wishlistHas(product.id) ? 'Removed from wishlist' : 'Added to wishlist'
    )
  }

  // ─── WhatsApp share ────────────────────────────────────────────────────────
  const handleWhatsAppShare = () => {
    if (!product) return
    const text = `Hi Murlidhar Offset, I'm interested in *${product.name}* (${formatINR(currentPrice)}). Please share more details.`
    window.open(`https://wa.me/919510737852?text=${encodeURIComponent(text)}`, '_blank')
  }

  // ─── Submit review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    if (!reviewForm.name || !reviewForm.comment) {
      sonnerToast.error('Please fill your name and review')
      return
    }
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewForm, productId: product.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success('Review submitted! It will appear after admin approval.')
      setReviewOpen(false)
      setReviewForm({ name: '', email: '', rating: 5, title: '', comment: '' })
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
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
                <div
                  ref={imgRef}
                  className="relative h-full w-full overflow-hidden cursor-zoom-in"
                  onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
                  onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
                  onMouseMove={handleMouseMove}
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={product.images[activeImage].url}
                    alt={product.images[activeImage].alt || product.name}
                    className="h-full w-full object-cover transition-transform duration-200"
                    style={
                      zoom.active
                        ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                        : { transform: 'scale(1)' }
                    }
                  />
                  {/* Expand hint */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxOpen(true) }}
                    className={`pointer-events-auto absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-navy/80 px-3 py-1.5 text-xs text-cream backdrop-blur transition-opacity hover:bg-navy hover:text-gold ${zoom.active ? 'opacity-0' : 'opacity-100'}`}
                    aria-label="Open fullscreen view"
                  >
                    <ZoomIn className="h-3 w-3 text-gold" /> Click to expand
                  </button>
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
              {/* Wishlist + share buttons overlay */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  onClick={handleToggleWishlist}
                  className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-all ${
                    wishlistHas(product.id)
                      ? 'bg-gold text-navy shadow-gold'
                      : 'bg-white/90 text-navy hover:bg-gold hover:text-navy'
                  }`}
                  aria-label={wishlistHas(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`h-4 w-4 ${wishlistHas(product.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-green-600 backdrop-blur transition hover:bg-green-500 hover:text-white"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scroll-elegant pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImage ? 'border-gold shadow-gold' : 'border-border hover:border-gold/50'
                    }`}
                  >
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
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} count={product.reviewCount} size={16} />
              <span className="text-xs text-muted-foreground">·</span>
              {matchedVariant ? (
                matchedVariant.stock > 0 ? (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    matchedVariant.stock < 10
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${matchedVariant.stock < 10 ? 'bg-amber-500' : 'bg-green-500'}`} />
                    {matchedVariant.stock < 10
                      ? `Only ${matchedVariant.stock} left in stock!`
                      : 'In stock · Ready to ship'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Out of stock — contact us
                  </span>
                )
              ) : (
                <span className="text-xs text-muted-foreground">Select options to see availability</span>
              )}
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
                disabled={(!matchedVariant && product.attributes.length > 0) || (matchedVariant?.stock === 0)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> {matchedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button
                onClick={handleOrderNow}
                size="lg"
                className="flex-1 bg-gold text-navy hover:bg-gold-deep hover:text-cream"
                disabled={(!matchedVariant && product.attributes.length > 0) || (matchedVariant?.stock === 0)}
              >
                <Zap className="mr-2 h-4 w-4" /> {matchedVariant?.stock === 0 ? 'Contact Us' : 'Order Now'}
              </Button>
              <Button
                onClick={handleToggleWishlist}
                size="lg"
                variant="outline"
                className={`shrink-0 border-navy ${wishlistHas(product.id) ? 'bg-gold text-navy' : 'text-navy hover:bg-navy hover:text-cream'}`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-4 w-4 ${wishlistHas(product.id) ? 'fill-current' : ''}`} />
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

        {/* ─── Customer Reviews ───────────────────────────────────────────────── */}
        <section className="mt-16">
          <MandalaDivider className="mb-10" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Customer Reviews"
              title="What Buyers Say"
              center={false}
            />
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button className="bg-navy text-cream hover:bg-navy-soft">
                  <Star className="mr-2 h-4 w-4" /> Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review — {product.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="rv-name">Your Name *</Label>
                      <Input id="rv-name" required value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} className="mt-1 border-border" />
                    </div>
                    <div>
                      <Label htmlFor="rv-email">Email (optional)</Label>
                      <Input id="rv-email" type="email" value={reviewForm.email} onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })} className="mt-1 border-border" />
                    </div>
                  </div>
                  <div>
                    <Label>Rating *</Label>
                    <div className="mt-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button key={r} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: r })} className="p-1">
                          <Star className={`h-7 w-7 transition ${r <= reviewForm.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30 hover:text-gold/60'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rv-title">Title</Label>
                    <Input id="rv-title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} className="mt-1 border-border" placeholder="A short summary" />
                  </div>
                  <div>
                    <Label htmlFor="rv-comment">Your Review *</Label>
                    <Textarea id="rv-comment" required value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={4} className="mt-1 resize-none border-border" placeholder="Tell us about your experience with this product..." />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={submittingReview}>
                      {submittingReview ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Review
                    </Button>
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground">Reviews are moderated and will appear after admin approval.</p>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Aggregate */}
          <div className="mt-6 grid gap-4 sm:grid-cols-[200px_1fr]">
            <Card className="card-premium p-6 text-center">
              <p className="font-display text-5xl font-bold text-navy">{reviewsAvg.toFixed(1)}</p>
              <div className="mt-2 flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(reviewsAvg) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}</p>
            </Card>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center">
                  <Star className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-2 font-display text-base font-bold text-navy">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to share your experience with this product.</p>
                </Card>
              ) : (
                reviews.map((r) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display font-bold text-gold">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{r.name}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {r.title && <p className="mt-2 font-semibold text-navy">{r.title}</p>}
                    <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ─── Recently Viewed ─────────────────────────────────────────────────── */}
        <RecentlyViewed excludeProductId={product.id} />

        {/* ─── Quick FAQ ────────────────────────────────────────────────────────── */}
        <ProductFAQ />
      </section>

      {/* Lightbox */}
      <ImageLightbox
        images={product.images.map((img) => ({ url: img.url, alt: img.alt || product.name }))}
        startIndex={activeImage}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}

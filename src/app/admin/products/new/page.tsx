'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon, Eye,
  Star, Zap, Package, Wand2, ChevronUp, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { VariantMatrixBuilder, AttrDraft, VariantDraft } from '@/components/admin/variant-matrix-builder'
import { slugify } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface Category { id: string; name: string }

// ─── Quick product templates ─────────────────────────────────────────────────
const TEMPLATES = [
  {
    label: 'Visiting Cards',
    icon: Package,
    name: 'Visiting Cards',
    shortDesc: 'Premium visiting cards with gold foil, dripoff UV, matt & texture finishes.',
    turnaround: 'Delivered in 3–4 working days',
    categoryHint: 'business',
    attrs: [
      { name: 'Card Type', options: ['Gold Foil 350 GSM', 'Matt Card 350 GSM', 'Dripoff UV 400 GSM', 'Artcard 250 GSM'] },
      { name: 'Quantity', options: ['100 pcs', '250 pcs', '500 pcs', '1000 pcs'] },
    ],
  },
  {
    label: 'Letterheads',
    icon: Package,
    name: 'Letterheads',
    shortDesc: 'Crisp professional letterheads on premium bond paper.',
    turnaround: 'Delivered in 2–3 working days',
    categoryHint: 'letterhead',
    attrs: [
      { name: 'Paper Type', options: ['100 GSM Alabaster', '100 GSM Cedar', '100 GSM Excel Bond'] },
      { name: 'Quantity', options: ['100 sheets', '250 sheets', '500 sheets'] },
    ],
  },
  {
    label: 'Pamphlets',
    icon: Package,
    name: 'Pamphlets & Flyers',
    shortDesc: 'High-impact promotional flyers in A5/A4 sizes.',
    turnaround: 'Delivered in 2–3 working days',
    categoryHint: 'pamphlet',
    attrs: [
      { name: 'Paper Type', options: ['90 GSM A5', '90 GSM A4', '130 GSM A4', '170 GSM A4'] },
      { name: 'Quantity', options: ['500 pcs', '1000 pcs', '2000 pcs'] },
    ],
  },
  {
    label: 'Wedding Cards',
    icon: Star,
    name: 'Wedding Cards (Kankotri)',
    shortDesc: 'Exquisite Gujarati wedding cards with gold foil and traditional motifs.',
    turnaround: 'Delivered in 5–7 working days',
    categoryHint: '',
    attrs: [
      { name: 'Type', options: ['Gold Foil Border', 'Spot UV Premium', 'Matt Lamination', 'Texture Premium'] },
      { name: 'Quantity', options: ['50 pcs', '100 pcs', '200 pcs', '500 pcs'] },
    ],
  },
  {
    label: 'Brochures',
    icon: Package,
    name: 'Brochures',
    shortDesc: 'Premium brochures with optional Spot UV finish.',
    turnaround: 'Delivered in 3–5 working days',
    categoryHint: 'brochure',
    attrs: [
      { name: 'Type', options: ['Bifold', 'Bifold with Spot UV', 'Trifold'] },
      { name: 'Quantity', options: ['100 pcs', '250 pcs', '500 pcs'] },
    ],
  },
  {
    label: 'Blank / Custom',
    icon: Wand2,
    name: '',
    shortDesc: '',
    turnaround: '',
    categoryHint: '',
    attrs: [],
  },
]

const QUICK_TURNAROUNDS = [
  'Same day',
  'Delivered in 1–2 working days',
  'Delivered in 2–3 working days',
  'Delivered in 3–4 working days',
  'Delivered in 5–7 working days',
]

export default function AdminProductEditorPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const id = params.id
  const isEdit = !!id

  const [categories, setCategories] = React.useState<Category[]>([])
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [fetching, setFetching] = React.useState(isEdit)
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)

  const [form, setForm] = React.useState({
    name: '', slug: '', shortDesc: '', description: '', categoryId: '',
    turnaroundNote: '', featured: false, active: true, rating: 5, reviewCount: 0,
  })
  const [images, setImages] = React.useState<{ url: string; alt?: string }[]>([])
  const [attributes, setAttributes] = React.useState<AttrDraft[]>([])
  const [variants, setVariants] = React.useState<VariantDraft[]>([])

  React.useEffect(() => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.items || [])
        if (!isEdit && d.items[0]) setForm((f) => ({ ...f, categoryId: d.items[0].id }))
      })
    if (isEdit && id) {
      fetch(`/api/admin/products/${id}?id=${id}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          const p = d.product
          setForm({
            name: p.name, slug: p.slug, shortDesc: p.shortDesc || '', description: p.description || '',
            categoryId: p.categoryId, turnaroundNote: p.turnaroundNote || '',
            featured: p.featured, active: p.active, rating: p.rating, reviewCount: p.reviewCount,
          })
          setSlugManuallyEdited(true)
          setImages(p.images.map((i: any) => ({ url: i.url, alt: i.alt })))
          const attrs: AttrDraft[] = (p.attributes || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((a: any) => ({
              name: a.name,
              options: a.options.sort((x: any, y: any) => x.order - y.order).map((o: any) => o.value),
            }))
          setAttributes(attrs)
          const vDrafts: VariantDraft[] = (p.variants || []).map((v: any) => {
            const opts: Record<string, string> = {}
            v.options.forEach((vo: any) => {
              const attrName = vo.option.attribute?.name
              if (attrName) opts[attrName] = vo.option.value
            })
            return { options: opts, price: v.price, sku: v.sku }
          })
          setTimeout(() => setVariants(vDrafts), 50)
        })
        .finally(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [id, isEdit])

  // Track dirty state
  React.useEffect(() => { setDirty(true) }, [form, images, attributes, variants])

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: slugManuallyEdited ? f.slug : slugify(name),
    }))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setForm((f) => ({ ...f, slug }))
  }

  // Apply template
  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setForm((f) => ({
      ...f,
      name: tpl.name || f.name,
      shortDesc: tpl.shortDesc || f.shortDesc,
      turnaroundNote: tpl.turnaround || f.turnaroundNote,
      slug: tpl.name ? slugify(tpl.name) : f.slug,
      categoryId: (() => {
        if (!tpl.categoryHint) return f.categoryId
        const match = categories.find((c) => c.slug.includes(tpl.categoryHint))
        return match?.id || f.categoryId
      })(),
    }))
    if (tpl.name) setSlugManuallyEdited(false)
    if (tpl.attrs.length > 0) {
      setAttributes(tpl.attrs.map((a) => ({ name: a.name, options: [...a.options] })))
    }
    sonnerToast.success(`Template applied: ${tpl.label}`)
  }

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('files', f))
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImages((prev) => [...prev, ...data.files.map((f: any) => ({ url: f.url, alt: form.name }))])
      sonnerToast.success(`Uploaded ${data.files.length} image(s)`)
    } catch (err: any) {
      sonnerToast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx))

  // Move image to position 0 (set as main)
  const setMainImage = (idx: number) => {
    setImages((prev) => {
      const next = [...prev]
      const [img] = next.splice(idx, 1)
      next.unshift(img)
      return next
    })
    sonnerToast.success('Set as main image')
  }

  const handleSave = async (stayOnPage = false) => {
    if (!form.name || !form.categoryId) {
      sonnerToast.error('Please fill in the product name and select a category')
      return
    }
    setSaving(true)
    try {
      const body = {
        ...form,
        rating: Number(form.rating),
        reviewCount: Number(form.reviewCount),
        images,
        attributes: attributes.filter((a) => a.name && a.options.every((o) => o)),
        variants: variants.filter((v) => Object.keys(v.options).length > 0),
      }
      const url = isEdit ? `/api/admin/products/${id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      sonnerToast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`)
      setDirty(false)
      if (!stayOnPage) {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (err: any) {
      sonnerToast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell admin={admin}>
      {/* Header bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href="/admin/products"><ArrowLeft className="mr-1 h-4 w-4" /> Products</Link>
          </Button>
          <h2 className="font-display text-2xl font-bold text-navy">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>
          {dirty && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          {isEdit && form.slug && (
            <Button asChild variant="outline" className="border-navy text-navy">
              <Link href={`/product/${form.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</Link>
            </Button>
          )}
          <Button onClick={() => handleSave(false)} className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save & Exit</>}
          </Button>
        </div>
      </div>

      {/* Quick templates (only for new products) */}
      {!isEdit && (
        <Card className="mb-6 overflow-hidden border-gold/30">
          <div className="border-b border-border bg-secondary/40 px-5 py-3">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
              <Zap className="h-4 w-4 text-gold" /> Quick Start — Apply a Template
            </h3>
            <p className="text-xs text-muted-foreground">Click a template to pre-fill product details + variant structure. You can edit everything after.</p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-3 lg:grid-cols-6">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl)}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-white p-3 text-center transition hover:border-gold hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-gold transition group-hover:bg-gold group-hover:text-navy">
                  <tpl.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-navy">{tpl.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Basic info */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Package className="h-4 w-4 text-gold" /> Basic Information
              </h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 border-border"
                  placeholder="e.g. Premium Business Cards"
                />
                <p className="mt-1 text-xs text-muted-foreground">This appears on the product card and detail page.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="mt-1 border-border font-mono text-sm"
                    placeholder="auto-generated"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Auto-generated from name. Click to edit.</p>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger className="mt-1 border-border"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="shortDesc">Short Description</Label>
                <Input
                  id="shortDesc"
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                  className="mt-1 border-border"
                  placeholder="One-line summary shown on product card"
                />
                <p className="mt-1 text-xs text-muted-foreground">{form.shortDesc.length}/120 characters</p>
              </div>
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="mt-1 resize-y border-border"
                  placeholder="Detailed product description shown on the product page..."
                />
              </div>
              <div>
                <Label htmlFor="turnaround">Turnaround / Delivery Note</Label>
                <Input
                  id="turnaround"
                  value={form.turnaroundNote}
                  onChange={(e) => setForm({ ...form, turnaroundNote: e.target.value })}
                  className="mt-1 border-border"
                  placeholder="e.g. Delivered in 3–4 working days"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_TURNAROUNDS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, turnaroundNote: t })}
                      className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-navy transition hover:border-gold hover:bg-gold/10"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Variants */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Star className="h-4 w-4 text-gold" /> Variants & Pricing
              </h3>
              <p className="text-xs text-muted-foreground">Define variant attributes (e.g. Paper Type, Quantity) and set price per combination.</p>
            </div>
            <div className="p-5">
              <VariantMatrixBuilder
                attributes={attributes}
                setAttributes={setAttributes}
                variants={variants}
                setVariants={setVariants}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Status & Visibility</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Visible on storefront</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show on homepage</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <Label htmlFor="rating" className="text-xs">Rating (0–5)</Label>
                  <Input id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className="mt-1 border-border" />
                </div>
                <div>
                  <Label htmlFor="rc" className="text-xs">Review Count</Label>
                  <Input id="rc" type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} className="mt-1 border-border" />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Product Images</h3>
            </div>
            <div className="p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition hover:border-gold hover:bg-gold/5">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                <span className="text-sm font-medium text-navy">{uploading ? 'Uploading...' : 'Click to upload'}</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5MB each</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                      <img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold text-navy">MAIN</span>
                      )}
                      {/* Hover controls */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-navy/60 opacity-0 transition group-hover:opacity-100">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => setMainImage(i)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-navy hover:bg-gold-soft"
                            title="Set as main image"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-white hover:bg-red-700"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className="mt-3 flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-secondary/20">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              {images.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {images.length} image(s). First image is shown as main on product cards. Hover an image to set as main or remove.
                </p>
              )}
            </div>
          </Card>

          {/* Quick save sidebar */}
          <div className="space-y-2">
            <Button onClick={() => handleSave(false)} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save & Exit</>}
            </Button>
            {isEdit && (
              <Button onClick={() => handleSave(true)} variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white" disabled={saving}>
                <Check className="mr-2 h-4 w-4" /> Save & Continue Editing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom save bar (appears when scrolling) */}
      {dirty && (
        <div className="sticky bottom-0 z-30 mt-6 -mx-4 border-t border-gold/30 bg-white/95 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-amber-700">●</span> You have unsaved changes
            </p>
            <div className="flex gap-2">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-navy">
                <Link href="/admin/products">Discard</Link>
              </Button>
              <Button onClick={() => handleSave(false)} className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

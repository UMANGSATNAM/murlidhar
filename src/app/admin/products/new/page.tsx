'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon, Plus, Package, Eye,
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
import { toast as sonnerToast } from 'sonner'

interface Category { id: string; name: string }

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
          setImages(p.images.map((i: any) => ({ url: i.url, alt: i.alt })))
          // Convert attributes & variants to draft form
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
          // Use a ref to set variants after attributes are set (the builder effect will preserve them)
          setTimeout(() => setVariants(vDrafts), 50)
        })
        .finally(() => setFetching(false))
    } else {
      setFetching(false)
    }
  }, [id, isEdit])

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

  const handleSave = async () => {
    if (!form.name || !form.categoryId) {
      sonnerToast.error('Name and category are required')
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
      sonnerToast.success(`Product ${isEdit ? 'updated' : 'created'}!`)
      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      sonnerToast.error(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href="/admin/products"><ArrowLeft className="mr-1 h-4 w-4" /> Products</Link>
          </Button>
          <h2 className="font-display text-2xl font-bold text-navy">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h2>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Button asChild variant="outline" className="border-navy text-navy">
              <Link href={`/product/${form.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</Link>
            </Button>
          )}
          <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Product</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          {/* Basic info */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Basic Information</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 border-border" placeholder="Premium Business Cards" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 border-border" placeholder="auto-generated from name" />
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
                <Input id="shortDesc" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} className="mt-1 border-border" placeholder="One-line summary shown on product card" />
              </div>
              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="mt-1 resize-none border-border" placeholder="Detailed product description..." />
              </div>
              <div>
                <Label htmlFor="turnaround">Turnaround Note</Label>
                <Input id="turnaround" value={form.turnaroundNote} onChange={(e) => setForm({ ...form, turnaroundNote: e.target.value })} className="mt-1 border-border" placeholder="e.g. Delivered in 3–4 working days" />
              </div>
            </div>
          </Card>

          {/* Variants */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Variants & Pricing</h3>
              <p className="text-xs text-muted-foreground">Define variant attributes and set price per combination.</p>
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
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Status</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Active</Label>
                  <p className="text-xs text-muted-foreground">Show on customer storefront</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show in homepage "Featured"</p>
                </div>
                <Switch checked={form.featured} onCheckedChange={(c) => setForm({ ...form, featured: c })} />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <Label htmlFor="rating" className="text-xs">Rating</Label>
                  <Input id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className="mt-1 border-border" />
                </div>
                <div>
                  <Label htmlFor="rc" className="text-xs">Reviews</Label>
                  <Input id="rc" type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} className="mt-1 border-border" />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-cream/60 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Product Images</h3>
            </div>
            <div className="p-5">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-6 text-center transition hover:border-gold hover:bg-gold/5">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                <span className="text-sm font-medium text-navy">{uploading ? 'Uploading...' : 'Upload images'}</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, WebP · max 5MB</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-secondary">
                      { }
                      <img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/80 text-cream opacity-0 transition group-hover:opacity-100 hover:bg-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[9px] font-bold text-navy">MAIN</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {images.length === 0 && (
                <div className="mt-3 flex aspect-video items-center justify-center rounded-md border border-dashed border-border bg-secondary/20">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}

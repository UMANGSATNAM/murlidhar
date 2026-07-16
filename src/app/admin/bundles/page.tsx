'use client'

import * as React from 'react'
import { Plus, Trash2, Edit, Loader2, Package, Save, X, Tag, Percent } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface Product { id: string; name: string; slug: string; basePrice: number }
interface BundleItem { id: string; productId: string; qty: number; product: Product }
interface Bundle {
  id: string; name: string; slug: string; description?: string
  originalPrice: number; bundlePrice: number; savings: number
  active: boolean; featured: boolean; createdAt: string
  items: BundleItem[]
  _count?: { items: number }
}

export default function AdminBundlesPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [bundles, setBundles] = React.useState<Bundle[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [editing, setEditing] = React.useState<Bundle | null>(null)
  const [open, setOpen] = React.useState(false)

  const fetchAll = () => {
    Promise.all([
      fetch('/api/admin/bundles', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/admin/products?page=1&pageSize=100', { credentials: 'include' }).then((r) => r.json()),
    ]).then(([b, p]) => {
      setBundles(b.items || [])
      setProducts((p.items || []).map((item: any) => ({ id: item.id, name: item.name, slug: item.slug, basePrice: item.basePrice })))
    }).finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchAll() }, [admin])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleDelete = async (b: Bundle) => {
    if (!confirm(`Delete bundle "${b.name}"?`)) return
    const res = await fetch(`/api/admin/bundles/${b.id}?id=${b.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Bundle deleted'); fetchAll() } else sonnerToast.error('Delete failed')
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Product Bundles</h2>
          <p className="text-sm text-muted-foreground">{bundles.length} bundles · combo deals to boost average order value</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-white" onClick={() => setEditing(null)}>
              <Plus className="mr-2 h-4 w-4" /> Create Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit' : 'New'} Bundle</DialogTitle></DialogHeader>
            {products.length > 0 && <BundleForm products={products} bundle={editing} onSave={async () => { setOpen(false); setEditing(null); fetchAll() }} onCancel={() => { setOpen(false); setEditing(null) }} />}
          </DialogContent>
        </Dialog>
      </div>

      {/* Info banner */}
      <Card className="mb-6 overflow-hidden border-gold/30 bg-gold/5">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20">
            <Tag className="h-5 w-5 text-gold-deep" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-navy">How bundles work</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create combo deals by grouping products together at a discounted price. The original price is auto-calculated from individual product prices.
              Customers see the savings and can add the entire bundle to cart with one click.
            </p>
          </div>
        </div>
      </Card>

      {bundles.length === 0 ? (
        <Card className="p-10 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 font-display text-lg font-bold text-navy">No bundles yet</p>
          <p className="text-sm text-muted-foreground">Create your first combo deal to boost sales.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="border-b border-border bg-secondary/40 px-4 py-2">
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {b.active ? 'Active' : 'Hidden'}
                  </span>
                  {b.featured && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy">FEATURED</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-bold text-navy">{b.name}</h3>
                {b.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.description}</p>}
                <div className="mt-3 space-y-1">
                  {b.items.map((it) => (
                    <p key={it.id} className="text-xs text-foreground/70">• {it.product.name} × {it.qty}</p>
                  ))}
                </div>
                <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground line-through">{formatINR(b.originalPrice)}</p>
                    <p className="font-display text-lg font-bold text-navy">{formatINR(b.bundlePrice)}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    Save {formatINR(b.savings)}
                  </span>
                </div>
                <div className="mt-3 flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1 border-navy text-navy" onClick={() => { setEditing(b); setOpen(true) }}>
                    <Edit className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(b)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  )
}

function BundleForm({ products, bundle, onSave, onCancel }: {
  products: Product[]
  bundle: Bundle | null
  onSave: () => void
  onCancel: () => void
}) {
  const [name, setName] = React.useState(bundle?.name || '')
  const [description, setDescription] = React.useState(bundle?.description || '')
  const [bundlePrice, setBundlePrice] = React.useState(String(bundle?.bundlePrice || ''))
  const [active, setActive] = React.useState(bundle?.active ?? true)
  const [featured, setFeatured] = React.useState(bundle?.featured ?? false)
  const [selectedItems, setSelectedItems] = React.useState<{ productId: string; qty: number }[]>(
    bundle?.items.map((it) => ({ productId: it.productId, qty: it.qty })) || []
  )
  const [saving, setSaving] = React.useState(false)

  // Calculate original price from selected items
  const originalPrice = selectedItems.reduce((s, it) => {
    const p = products.find((pr) => pr.id === it.productId)
    return s + (p?.basePrice || 0) * it.qty
  }, 0)
  const savings = Math.max(0, originalPrice - (parseFloat(bundlePrice) || 0))

  const addItem = (productId: string) => {
    if (!productId || selectedItems.find((i) => i.productId === productId)) return
    setSelectedItems([...selectedItems, { productId, qty: 1 }])
  }
  const removeItem = (productId: string) => setSelectedItems(selectedItems.filter((i) => i.productId !== productId))
  const updateQty = (productId: string, qty: number) => {
    setSelectedItems(selectedItems.map((i) => i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i))
  }

  const handleSave = async () => {
    if (!name || selectedItems.length === 0) {
      sonnerToast.error('Name and at least 1 product required')
      return
    }
    setSaving(true)
    try {
      const body = { name, description, bundlePrice: parseFloat(bundlePrice) || 0, active, featured, items: selectedItems }
      const url = bundle?.id ? `/api/admin/bundles/${bundle.id}` : '/api/admin/bundles'
      const method = bundle?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success(`Bundle ${bundle?.id ? 'updated' : 'created'}!`)
      onSave()
    } catch (err: any) {
      sonnerToast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Bundle Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 border-border" placeholder="e.g. Business Starter Kit" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 resize-none border-border" placeholder="What's included in this combo deal..." />
      </div>
      <div>
        <Label>Products in Bundle *</Label>
        <div className="mt-1 flex gap-2">
          <Select onValueChange={addItem}>
            <SelectTrigger className="flex-1 border-border"><SelectValue placeholder="Add a product..." /></SelectTrigger>
            <SelectContent>
              {products.filter((p) => !selectedItems.find((i) => i.productId === p.id)).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} ({formatINR(p.basePrice)})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedItems.length > 0 && (
          <div className="mt-2 space-y-2">
            {selectedItems.map((it) => {
              const p = products.find((pr) => pr.id === it.productId)
              return (
                <div key={it.productId} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 p-2">
                  <span className="flex-1 truncate text-sm text-navy">{p?.name}</span>
                  <Input type="number" min="1" value={it.qty} onChange={(e) => updateQty(it.productId, parseInt(e.target.value) || 1)} className="h-8 w-16 border-border text-sm" />
                  <span className="text-xs text-muted-foreground">{formatINR((p?.basePrice || 0) * it.qty)}</span>
                  <button onClick={() => removeItem(it.productId)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Bundle Price (₹) *</Label>
          <Input type="number" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} className="mt-1 border-border" placeholder="e.g. 599" />
        </div>
        <div>
          <Label>Original Price (auto)</Label>
          <Input value={formatINR(originalPrice)} disabled className="mt-1 border-border bg-secondary/50 text-muted-foreground" />
        </div>
      </div>
      {savings > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm">
          <Percent className="h-4 w-4 text-green-600" />
          <span className="text-green-700">Customer saves <strong>{formatINR(savings)}</strong> ({Math.round((savings / originalPrice) * 100)}% off)</span>
        </div>
      )}
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <Label className="text-sm">Active</Label>
          <p className="text-xs text-muted-foreground">Visible on storefront</p>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <Label className="text-sm">Featured</Label>
          <p className="text-xs text-muted-foreground">Show on homepage</p>
        </div>
        <Switch checked={featured} onCheckedChange={setFeatured} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {bundle?.id ? 'Update' : 'Create'} Bundle
        </Button>
      </div>
    </div>
  )
}

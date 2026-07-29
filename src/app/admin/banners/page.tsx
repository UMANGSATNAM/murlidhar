'use client'

import * as React from 'react'
import Image from 'next/image'
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, Upload, Save, X, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Banner {
  id: string; title?: string; subtitle?: string; imageUrl: string; link?: string
  position: string; order: number; active: boolean
}

export default function AdminBannersPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [banners, setBanners] = React.useState<Banner[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [editing, setEditing] = React.useState<Banner | null>(null)
  const [open, setOpen] = React.useState(false)

  const fetchBanners = () => {
    fetch('/api/admin/banners', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setBanners(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchBanners() }, [admin])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleSave = async (b: Partial<Banner>) => {
    try {
      if (b.id) {
        const res = await fetch(`/api/admin/banners/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(b) })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Banner updated')
      } else {
        const res = await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(b) })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Banner created')
      }
      setOpen(false); setEditing(null); fetchBanners()
    } catch (err: any) { sonnerToast.error(err.message) }
  }
  const handleDelete = async (b: Banner) => {
    if (!confirm('Delete this banner?')) return
    const res = await fetch(`/api/admin/banners/${b.id}?id=${b.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Deleted'); fetchBanners() } else sonnerToast.error('Delete failed')
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Banners & Hero Images</h2>
          <p className="text-sm text-muted-foreground">{banners.length} banners · changes appear on live site instantly</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" onClick={() => setEditing({ imageUrl: '', position: 'hero', order: 0, active: true })}>
              <Plus className="mr-2 h-4 w-4" /> Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit' : 'New'} Banner</DialogTitle></DialogHeader>
            {editing && <BannerForm banner={editing} onSave={handleSave} onCancel={() => { setOpen(false); setEditing(null) }} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative aspect-video bg-secondary">
              { }
              <Image src={b.imageUrl} alt={b.title || 'banner'} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              <div className="absolute right-2 top-2 flex gap-1">
                <button onClick={() => { setEditing(b); setOpen(true) }} className="flex h-7 w-7 items-center justify-center rounded bg-background/80 text-foreground hover:bg-gold hover:text-navy"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => handleDelete(b)} className="flex h-7 w-7 items-center justify-center rounded bg-background/80 text-foreground hover:bg-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {b.active ? <Eye className="inline h-3 w-3" /> : <EyeOff className="inline h-3 w-3" />} {b.active ? 'Live' : 'Hidden'}
              </span>
            </div>
            <div className="p-4">
              <p className="font-display text-sm font-bold text-navy line-clamp-1">{b.title || '(no title)'}</p>
              {b.subtitle && <p className="text-xs text-muted-foreground line-clamp-2">{b.subtitle}</p>}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>#{b.order} · {b.position}</span>
                {b.link && <a href={b.link} target="_blank" className="text-gold-deep hover:underline">link →</a>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}

function BannerForm({ banner, onSave, onCancel }: { banner: Banner; onSave: (b: Partial<Banner>) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState(banner)
  const [uploading, setUploading] = React.useState(false)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach((f) => fd.append('files', f))
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm({ ...form, imageUrl: data.files[0].url })
      sonnerToast.success('Image uploaded')
    } catch (err: any) { sonnerToast.error(err.message) } finally { setUploading(false); e.target.value = '' }
  }
  return (
    <div className="space-y-4">
      <div>
        <Label>Image *</Label>
        <div className="mt-1 flex gap-2">
          <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="border-border" placeholder="/banners/hero-1.jpg" />
          <label className="cursor-pointer">
            <Button type="button" variant="outline" className="border-navy text-navy" disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
        {form.imageUrl && (
          <div className="relative mt-2 aspect-video overflow-hidden rounded-md border border-border bg-secondary">
            { }
            <Image src={form.imageUrl} alt="preview" fill sizes="400px" className="object-cover" />
          </div>
        )}
      </div>
      <div>
        <Label>Title</Label>
        <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 border-border" />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1 border-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Link (URL)</Label>
          <Input value={form.link || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} className="mt-1 border-border" placeholder="/shop" />
        </div>
        <div>
          <Label>Position</Label>
          <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm">
            <option value="hero">Hero Slider</option>
            <option value="promo">Promo Strip</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Order</Label>
          <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="mt-1 border-border" />
        </div>
        <div className="flex items-end justify-between rounded-md border border-border p-3">
          <Label className="text-sm">Active</Label>
          <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}><X className="mr-2 h-4 w-4" /> Cancel</Button>
        <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground" disabled={!form.imageUrl} onClick={() => onSave(form)}><Save className="mr-2 h-4 w-4" /> Save</Button>
      </div>
    </div>
  )
}

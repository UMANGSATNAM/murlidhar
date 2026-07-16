'use client'

import * as React from 'react'
import { Plus, Trash2, Edit, Loader2, Star, Save, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Testimonial {
  id: string; name: string; location?: string; rating: number; text: string; active: boolean; createdAt: string
}

export default function AdminTestimonialsPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [items, setItems] = React.useState<Testimonial[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [editing, setEditing] = React.useState<Testimonial | null>(null)
  const [open, setOpen] = React.useState(false)

  const fetchItems = () => {
    fetch('/api/admin/testimonials', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchItems() }, [admin])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleSave = async (t: Partial<Testimonial>) => {
    try {
      if (t.id) {
        const res = await fetch(`/api/admin/testimonials/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(t) })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Testimonial updated')
      } else {
        const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(t) })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Testimonial created')
      }
      setOpen(false); setEditing(null); fetchItems()
    } catch (err: any) { sonnerToast.error(err.message) }
  }
  const handleDelete = async (t: Testimonial) => {
    if (!confirm('Delete this testimonial?')) return
    const res = await fetch(`/api/admin/testimonials/${t.id}?id=${t.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Deleted'); fetchItems() } else sonnerToast.error('Delete failed')
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Testimonials</h2>
          <p className="text-sm text-muted-foreground">{items.length} reviews</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" onClick={() => setEditing({ name: '', location: '', rating: 5, text: '', active: true, createdAt: new Date().toISOString() })}>
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit' : 'New'} Testimonial</DialogTitle></DialogHeader>
            {editing && <TestimonialForm item={editing} onSave={handleSave} onCancel={() => { setOpen(false); setEditing(null) }} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <Card key={t.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-display font-bold text-teal">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-navy">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location || '—'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-navy" onClick={() => { setEditing(t); setOpen(true) }}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(t)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-2 flex">
              {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-teal text-teal" />)}
            </div>
            <p className="mt-2 text-sm text-foreground/80 line-clamp-3">"{t.text}"</p>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
              <span className="text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
              <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${t.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {t.active ? 'Active' : 'Hidden'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}

function TestimonialForm({ item, onSave, onCancel }: { item: Testimonial; onSave: (t: Partial<Testimonial>) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState(item)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 border-border" />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 border-border" placeholder="Unjha" />
        </div>
      </div>
      <div>
        <Label>Rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })} className="p-1">
              <Star className={`h-6 w-6 ${r <= form.rating ? 'fill-teal text-teal' : 'text-muted-foreground/30'}`} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Review Text *</Label>
        <Textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} className="mt-1 resize-none border-border" />
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label className="text-sm">Active</Label>
        <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}><X className="mr-2 h-4 w-4" /> Cancel</Button>
        <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" onClick={() => onSave(form)}><Save className="mr-2 h-4 w-4" /> Save</Button>
      </div>
    </div>
  )
}

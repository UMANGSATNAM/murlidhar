'use client'

import * as React from 'react'
import { Plus, Trash2, Edit, Loader2, FolderTree, Save, X } from 'lucide-react'
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

interface Category {
  id: string; name: string; slug: string; description?: string
  image?: string; icon?: string; order: number; active: boolean
  _count?: { products: number }
}

const ICONS = ['CreditCard', 'FileText', 'Mail', 'Newspaper', 'BookOpen', 'Folder', 'Printer', 'Star', 'HeartHandshake', 'Sparkles', 'Calendar', 'Package']

export default function AdminCategoriesPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [cats, setCats] = React.useState<Category[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [editing, setEditing] = React.useState<Category | null>(null)
  const [open, setOpen] = React.useState(false)

  const fetchCats = () => {
    fetch('/api/admin/categories', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCats(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchCats() }, [admin])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleSave = async (cat: Partial<Category>) => {
    try {
      if (cat.id) {
        const res = await fetch(`/api/admin/categories/${cat.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify(cat),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Category updated')
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify(cat),
        })
        if (!res.ok) throw new Error((await res.json()).error)
        sonnerToast.success('Category created')
      }
      setOpen(false)
      setEditing(null)
      fetchCats()
    } catch (err: any) {
      sonnerToast.error(err.message || 'Save failed')
    }
  }

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/categories/${c.id}?id=${c.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      sonnerToast.success('Category deleted')
      fetchCats()
    } catch (err: any) {
      sonnerToast.error(err.message)
    }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Categories</h2>
          <p className="text-sm text-muted-foreground">{cats.length} categories</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" onClick={() => setEditing({ name: '', slug: '', description: '', icon: 'Folder', order: 0, active: true })}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? 'Edit' : 'New'} Category</DialogTitle></DialogHeader>
            {editing && <CategoryForm cat={editing} onSave={handleSave} onCancel={() => { setOpen(false); setEditing(null) }} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-teal">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-navy">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-navy" onClick={() => { setEditing(c); setOpen(true) }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {c.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">{c._count?.products ?? 0} products</span>
              <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {c.active ? 'Active' : 'Hidden'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}

function CategoryForm({ cat, onSave, onCancel }: { cat: Category; onSave: (c: Partial<Category>) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState(cat)
  return (
    <div className="space-y-4">
      <div>
        <Label>Name *</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 border-border" />
      </div>
      <div>
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 border-border" placeholder="auto from name" />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 resize-none border-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Icon</Label>
          <select value={form.icon || 'Folder'} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm">
            {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <Label>Order</Label>
          <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="mt-1 border-border" />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <Label className="text-sm">Active (visible on storefront)</Label>
        <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}><X className="mr-2 h-4 w-4" /> Cancel</Button>
        <Button className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" onClick={() => onSave(form)}><Save className="mr-2 h-4 w-4" /> Save</Button>
      </div>
    </div>
  )
}

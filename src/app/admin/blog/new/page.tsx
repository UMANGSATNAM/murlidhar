'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { MdxEditor } from '@/components/admin/mdx-editor'
import { toast as sonnerToast } from 'sonner'

export default function AdminBlogEditorPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const id = params.id
  const isEdit = !!id
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [fetching, setFetching] = React.useState(isEdit)
  const [form, setForm] = React.useState({
    title: '', slug: '', excerpt: '', content: '', featuredImage: '', tags: '', published: false, author: 'Prince Patel',
  })

  React.useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/admin/blog`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          const p = (d.items || []).find((x: any) => x.id === id)
          if (p) setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', featuredImage: p.featuredImage || '', tags: p.tags || '', published: p.published, author: p.author || 'Prince Patel' })
        })
        .finally(() => setFetching(false))
    } else setFetching(false)
  }, [id, isEdit])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

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
      setForm({ ...form, featuredImage: data.files[0].url })
      sonnerToast.success('Featured image uploaded')
    } catch (err: any) { sonnerToast.error(err.message) } finally { setUploading(false); e.target.value = '' }
  }

  const handleSave = async () => {
    if (!form.title) { sonnerToast.error('Title is required'); return }
    setSaving(true)
    try {
      const url = isEdit ? `/api/admin/blog/${id}` : '/api/admin/blog'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      sonnerToast.success(`Post ${isEdit ? 'updated' : 'created'}`)
      router.push('/admin/blog')
    } catch (err: any) { sonnerToast.error(err.message) } finally { setSaving(false) }
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href="/admin/blog"><ArrowLeft className="mr-1 h-4 w-4" /> Blog</Link>
          </Button>
          <h2 className="font-display text-2xl font-bold text-navy">{isEdit ? 'Edit Post' : 'New Post'}</h2>
        </div>
        <div className="flex gap-2">
          {isEdit && form.published && (
            <Button asChild variant="outline" className="border-navy text-navy">
              <Link href={`/blog/${form.slug}`} target="_blank"><Eye className="mr-2 h-4 w-4" /> Preview</Link>
            </Button>
          )}
          <Button onClick={handleSave} className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Post
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Post Content</h3>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 border-border" placeholder="How to Prepare a Print-Ready File" />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1 border-border" placeholder="auto-generated from title" />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="mt-1 resize-none border-border" placeholder="Short summary shown on blog list..." />
              </div>
              <div>
                <Label>Content</Label>
                <p className="mb-2 text-xs text-muted-foreground">Write using the rich text editor. Supports headings, bold/italic, lists, links, tables, and more.</p>
                <MdxEditor
                  value={form.content}
                  onChange={(md) => setForm({ ...form, content: md })}
                  placeholder="Start writing your blog post..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Publish</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Published</Label>
                  <p className="text-xs text-muted-foreground">Visible on blog page</p>
                </div>
                <Switch checked={form.published} onCheckedChange={(c) => setForm({ ...form, published: c })} />
              </div>
              <div>
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="mt-1 border-border" />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1 border-border" placeholder="printing tips, visiting cards" />
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/40 px-5 py-3">
              <h3 className="font-display text-base font-bold text-navy">Featured Image</h3>
            </div>
            <div className="p-5">
              {form.featuredImage ? (
                <div className="group relative aspect-video overflow-hidden rounded-md border border-border">
                  { }
                  <img src={form.featuredImage} alt="featured" className="h-full w-full object-cover" />
                  <button onClick={() => setForm({ ...form, featuredImage: '' })} className="absolute right-2 top-2 rounded bg-navy/80 px-2 py-1 text-xs text-cream hover:bg-destructive">Remove</button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/30 px-4 py-8 text-center hover:border-gold hover:bg-gold/5">
                  {uploading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                  <span className="text-sm font-medium text-navy">{uploading ? 'Uploading...' : 'Upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} {isEdit ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}

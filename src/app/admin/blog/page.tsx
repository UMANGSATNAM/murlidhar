'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Loader2, FileText, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Post {
  id: string; title: string; slug: string; excerpt?: string
  featuredImage?: string; published: boolean; author?: string; createdAt: string
}

export default function AdminBlogPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [posts, setPosts] = React.useState<Post[]>([])
  const [fetching, setFetching] = React.useState(true)

  const fetchPosts = () => {
    fetch('/api/admin/blog', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setPosts(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchPosts() }, [admin])

  const handleDelete = async (p: Post) => {
    if (!confirm(`Delete "${p.title}"?`)) return
    const res = await fetch(`/api/admin/blog/${p.id}?id=${p.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Post deleted'); fetchPosts() } else sonnerToast.error('Delete failed')
  }

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">{posts.length} posts</p>
        </div>
        <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-foreground">
          <Link href="/admin/blog/new"><Plus className="mr-2 h-4 w-4" /> New Post</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Card key={p.id} className="overflow-hidden">
            <div className="relative aspect-video bg-secondary">
              {p.featuredImage ? (
                 
                <Image src={p.featuredImage} alt={p.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"><FileText className="h-10 w-10 text-muted-foreground/30" /></div>
              )}
              <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.published ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                {p.published ? <><Eye className="inline h-3 w-3" /> Published</> : <><EyeOff className="inline h-3 w-3" /> Draft</>}
              </span>
            </div>
            <div className="p-4">
              <p className="font-display text-base font-bold text-navy line-clamp-2">{p.title}</p>
              {p.excerpt && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p>}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                {p.author && <span>· {p.author}</span>}
              </div>
              <div className="mt-3 flex gap-1 border-t border-border pt-3">
                <Button asChild size="sm" variant="outline" className="flex-1 border-navy text-navy">
                  <Link href={`/admin/blog/${p.id}`}><Edit className="mr-1 h-3.5 w-3.5" /> Edit</Link>
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}

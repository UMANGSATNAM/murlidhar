'use client'

import * as React from 'react'
import { Check, X, Trash2, Loader2, Star, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Review {
  id: string; name: string; email?: string | null; rating: number
  title?: string | null; comment: string; active: boolean; createdAt: string
  product?: { name: string; slug: string }
}

export default function AdminReviewsPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [fetching, setFetching] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState<'pending' | 'approved' | 'all'>('pending')

  const fetchReviews = () => {
    setFetching(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    fetch(`/api/admin/reviews?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setReviews(d.items || []))
      .finally(() => setFetching(false))
  }
  React.useEffect(() => { if (admin) fetchReviews() }, [admin, statusFilter])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const toggleActive = async (r: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: r.id, active: !r.active }),
      })
      if (!res.ok) throw new Error('Failed')
      sonnerToast.success(r.active ? 'Review hidden' : 'Review approved & published')
      fetchReviews()
    } catch (err: any) {
      sonnerToast.error(err.message || 'Failed')
    }
  }

  const handleDelete = async (r: Review) => {
    if (!confirm('Delete this review permanently?')) return
    const res = await fetch(`/api/admin/reviews/${r.id}?id=${r.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Review deleted'); fetchReviews() } else sonnerToast.error('Delete failed')
  }

  const pendingCount = reviews.filter((r) => !r.active).length

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Product Reviews</h2>
          <p className="text-sm text-muted-foreground">{reviews.length} reviews · {pendingCount} pending approval</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
          {(['pending', 'approved', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase transition ${
                statusFilter === s ? 'bg-background text-foreground' : 'text-navy hover:bg-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card className="p-10 text-center">
          <Star className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 font-display text-lg font-bold text-navy">No reviews in this view</p>
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'pending'
              ? 'All customer reviews have been reviewed.'
              : 'When customers submit reviews, they will appear here for moderation.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className={`overflow-hidden ${!r.active ? 'border-amber-300 bg-amber-50/30' : ''}`}>
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background font-display font-bold text-teal">
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-navy">{r.name}</p>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-teal text-teal' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      r.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.active ? <><CheckCircle2 className="h-3 w-3" /> Published</> : <><Clock className="h-3 w-3" /> Pending</>}
                    </span>
                  </div>
                  {r.product && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      on <span className="font-semibold">{r.product.name}</span>
                    </p>
                  )}
                  {r.title && <p className="mt-2 font-semibold text-navy">{r.title}</p>}
                  <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {r.email && ` · ${r.email}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    onClick={() => toggleActive(r)}
                    className={r.active
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-green-600 text-white hover:bg-green-700'}
                  >
                    {r.active ? <><X className="mr-1 h-3.5 w-3.5" /> Unpublish</> : <><Check className="mr-1 h-3.5 w-3.5" /> Approve</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(r)}
                  >
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

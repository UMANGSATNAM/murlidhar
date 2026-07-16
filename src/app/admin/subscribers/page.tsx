'use client'

import * as React from 'react'
import { Mail, Trash2, Search, Loader2, Users, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { toast as sonnerToast } from 'sonner'

interface Subscriber {
  id: string; email: string; name?: string | null; active: boolean
  source: string; createdAt: string
}

export default function AdminSubscribersPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [items, setItems] = React.useState<Subscriber[]>([])
  const [totalActive, setTotalActive] = React.useState(0)
  const [q, setQ] = React.useState('')
  const [fetching, setFetching] = React.useState(true)

  const fetchSubs = React.useCallback(() => {
    setFetching(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    fetch(`/api/admin/subscribers?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setTotalActive(d.totalActive || 0)
      })
      .finally(() => setFetching(false))
  }, [q])

  React.useEffect(() => { if (admin) fetchSubs() }, [admin, fetchSubs])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const handleDelete = async (s: Subscriber) => {
    if (!confirm(`Remove ${s.email} from subscribers?`)) return
    const res = await fetch(`/api/admin/subscribers?id=${s.id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) { sonnerToast.success('Subscriber removed'); fetchSubs() } else sonnerToast.error('Delete failed')
  }

  const handleExport = () => {
    const csv = ['Email,Name,Source,Subscribed On']
      .concat(items.map((s) => `"${s.email}","${s.name || ''}","${s.source}","${new Date(s.createdAt).toISOString()}"`))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    sonnerToast.success(`Exported ${items.length} subscribers`)
  }

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Newsletter Subscribers</h2>
          <p className="text-sm text-muted-foreground">{totalActive} active subscribers</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-navy text-navy">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by email..."
          className="pl-10 border-border bg-white"
        />
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-3 font-display text-lg font-bold text-navy">No subscribers yet</p>
          <p className="text-sm text-muted-foreground">When customers subscribe via the footer or home page, they'll appear here.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-center">Source</th>
                  <th className="px-4 py-3 text-left">Subscribed On</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((s) => (
                  <tr key={s.id} className="hover:bg-cream/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gold" />
                        <span className="font-medium text-navy">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.name || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-navy">{s.source}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminShell>
  )
}

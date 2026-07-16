'use client'

import * as React from 'react'
import { Search, Loader2, Award, Star, Gift, Users, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'

interface Account {
  id: string; phone: string; name?: string | null; email?: string | null
  points: number; totalEarned: number; totalRedeemed: number; createdAt: string
}

export default function AdminLoyaltyPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [accounts, setAccounts] = React.useState<Account[]>([])
  const [total, setTotal] = React.useState(0)
  const [q, setQ] = React.useState('')
  const [fetching, setFetching] = React.useState(true)

  const fetchAccounts = React.useCallback(() => {
    setFetching(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    fetch(`/api/admin/loyalty?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.items || [])
        setTotal(d.total || 0)
      })
      .finally(() => setFetching(false))
  }, [q])

  React.useEffect(() => { if (admin) fetchAccounts() }, [admin, fetchAccounts])

  if (loading || fetching) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  const totalPointsInCirculation = accounts.reduce((s, a) => s + a.points, 0)
  const totalEarnedAllTime = accounts.reduce((s, a) => s + a.totalEarned, 0)

  return (
    <AdminShell admin={admin}>
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold text-navy">Loyalty Program</h2>
        <p className="text-sm text-muted-foreground">{total} customers · {totalPointsInCirculation} points in circulation</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Members</p>
              <p className="mt-1 font-display text-2xl font-bold text-navy">{total}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-navy">
              <Users className="h-5 w-5 text-gold" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Points In Circulation</p>
              <p className="mt-1 font-display text-2xl font-bold text-navy">{totalPointsInCirculation}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold">
              <Star className="h-5 w-5 text-navy" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Earned (All Time)</p>
              <p className="mt-1 font-display text-2xl font-bold text-navy">{totalEarnedAllTime}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Info banner */}
      <Card className="mb-6 overflow-hidden border-gold/30 bg-gold/5">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/20">
            <Award className="h-5 w-5 text-gold-deep" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-navy">How loyalty points work</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Customers earn 1 point per ₹10 spent. Points are automatically awarded when an order is marked "Delivered" in the admin.
              1 point = ₹1 discount. Customers can check their balance at <code className="rounded bg-white px-1 text-navy">/loyalty</code> using their phone number.
              To redeem, customers mention their phone at checkout — verify the balance here, then apply a manual discount on the order.
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by phone, name, or email..."
          className="pl-10 border-border bg-white"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {accounts.length === 0 ? (
          <div className="p-10 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No loyalty accounts yet</p>
            <p className="text-sm text-muted-foreground">When orders are marked "Delivered", customers will automatically earn points.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-right">Current Points</th>
                  <th className="px-4 py-3 text-right">Total Earned</th>
                  <th className="px-4 py-3 text-right">Redeemed</th>
                  <th className="px-4 py-3 text-left">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{a.name || '—'}</p>
                      {a.email && <p className="text-xs text-muted-foreground">{a.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.phone}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-display text-base font-bold text-gold-deep">{a.points}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({formatINR(a.points)})</span>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground/80">{a.totalEarned}</td>
                    <td className="px-4 py-3 text-right text-foreground/80">{a.totalRedeemed}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  )
}

function formatINR(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

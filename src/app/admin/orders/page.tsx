'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Filter, Download, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { StatusBadge } from '@/app/admin/dashboard/page'
import { formatINR } from '@/lib/format'

interface Order {
  id: string; orderNumber: string; customerName: string; phone: string; email?: string
  total: number; orderStatus: string; paymentStatus: string; paymentMethod: string
  createdAt: string; _count?: { items: number; files: number }
}

const ORDER_STATUSES = ['pending', 'production', 'ready', 'dispatched', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function AdminOrdersPage() {
  const { admin, loading } = useAdmin()
  useAdminRedirect(admin, loading)
  const [orders, setOrders] = React.useState<Order[]>([])
  const [total, setTotal] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [q, setQ] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [paymentFilter, setPaymentFilter] = React.useState('')
  const [listLoading, setListLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<string[]>([])

  const handleBulkAction = async (action: string, data?: any) => {
    if (action === 'delete' && !confirm(`Delete ${selected.length} orders? This cannot be undone.`)) return
    
    try {
      const res = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ids: selected, data })
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error)
      sonnerToast.success(resData.message || 'Bulk action completed')
      setSelected([])
      // force reload
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (statusFilter) params.set('status', statusFilter)
      if (paymentFilter) params.set('payment', paymentFilter)
      params.set('page', String(page))
      fetch(`/api/orders?${params}`, { credentials: 'include' }).then(r => r.json()).then(d => { setOrders(d.items || []); setTotal(d.total || 0) })
    } catch (err: any) {
      sonnerToast.error(err.message || 'Bulk action failed')
    }
  }

  React.useEffect(() => {
    if (!admin) return
    setListLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (statusFilter) params.set('status', statusFilter)
    if (paymentFilter) params.set('payment', paymentFilter)
    params.set('page', String(page))
    fetch(`/api/orders?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.items || [])
        setTotal(d.total || 0)
        setTotalPages(d.totalPages || 1)
      })
      .finally(() => setListLoading(false))
  }, [admin, q, statusFilter, paymentFilter, page])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
  if (!admin) return null

  return (
    <AdminShell admin={admin}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Orders</h2>
          <p className="text-sm text-muted-foreground">{total} total orders</p>
        </div>
        <Button asChild className="bg-gold text-navy hover:bg-gold-deep hover:text-white">
          <Link href="/admin/orders/new"><Plus className="mr-2 h-4 w-4" /> New Phone Order</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search by order #, name, phone, email..."
            className="pl-10 border-border bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button
          asChild
          variant="outline"
          className="border-navy text-navy hover:bg-background hover:text-white"
        >
          <a
            href={`/api/admin/orders/export?status=${statusFilter}&payment=${paymentFilter}&q=${encodeURIComponent(q)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-navy/10 bg-background/5 px-4 py-2">
          <span className="text-sm font-semibold text-navy">{selected.length} selected</span>
          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-md border border-border bg-white px-3 text-sm"
              onChange={(e) => {
                if (e.target.value) handleBulkAction('status', { orderStatus: e.target.value })
                e.target.value = ''
              }}
            >
              <option value="">Update Status...</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="h-9 rounded-md border border-border bg-white px-3 text-sm"
              onChange={(e) => {
                if (e.target.value) handleBulkAction('status', { paymentStatus: e.target.value })
                e.target.value = ''
              }}
            >
              <option value="">Update Payment...</option>
              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>Delete</Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        {listLoading ? (
          <div className="p-10 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" /></div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No orders found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input type="checkbox" className="rounded border-navy/20 text-gold focus:ring-gold" checked={orders.length > 0 && selected.length === orders.length} onChange={(e) => setSelected(e.target.checked ? orders.map(o => o.id) : [])} />
                  </th>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-center">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Payment</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-navy/20 text-gold focus:ring-gold" checked={selected.includes(o.id)} onChange={(e) => setSelected(prev => e.target.checked ? [...prev, o.id] : prev.filter(id => id !== o.id))} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-navy hover:text-teal">{o.orderNumber}</Link>
                      {(o._count?.files ?? 0) > 0 && <span className="ml-1 text-[10px] text-gold-deep">📎 {o._count?.files}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{o._count?.items ?? 0}</td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">{formatINR(o.total)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={o.orderStatus} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="border-navy text-navy">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="border-navy text-navy">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </AdminShell>
  )
}

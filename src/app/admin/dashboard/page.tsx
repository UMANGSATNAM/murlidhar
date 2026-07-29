'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ShoppingCart, ArrowRight, TrendingUp,
  Package, AlertCircle, FileText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminShell, useAdmin } from '@/components/admin/admin-shell'
import { useAdminRedirect } from '@/components/admin/use-admin-redirect'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { formatINR } from '@/lib/format'

interface Order {
  id: string; orderNumber: string; customerName: string; phone: string
  total: number; orderStatus: string; paymentStatus: string; createdAt: string
  _count?: { items: number; files: number }
}

export default function DashboardPage() {
  const { admin, loading } = useAdmin()
  const [recentOrders, setRecentOrders] = React.useState<Order[]>([])

  React.useEffect(() => {
    fetch('/api/orders?page=1&pageSize=5', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setRecentOrders(d.items || [])
      })
  }, [])

  useAdminRedirect(admin, loading)
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
  }
  if (!admin) return null

  return (
    <AdminShell admin={admin}>
      {/* Welcome banner */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-b from-background to-secondary/20 p-6 text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal">Welcome back</p>
              <h2 className="mt-1 font-display text-2xl font-bold">{admin.name || admin.email}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Here's what's happening at your print studio today.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-gold text-navy hover:bg-gold-soft">
                <Link href="/admin/products/new">Add Product</Link>
              </Button>
              <Button asChild variant="outline" className="border-gold/50 text-gold hover:bg-gold hover:text-navy">
                <Link href="/admin/orders">View Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats grid — now replaced by AnalyticsCharts with KPIs + graphs */}
      <AnalyticsCharts />

      {/* Recent orders */}
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
            <TrendingUp className="h-4 w-4 text-gold" /> Recent Orders
          </h3>
          <Button asChild variant="ghost" size="sm" className="text-navy">
            <Link href="/admin/orders">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No orders yet</p>
            <p className="text-sm text-muted-foreground">When customers place orders, they'll appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Order #</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Payment</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-navy hover:text-teal">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-navy">{o.customerName}</p>
                      <p className="text-xs text-muted-foreground">{o.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{o._count?.items ?? 0}</td>
                    <td className="px-5 py-3 text-right font-semibold text-navy">{formatINR(o.total)}</td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <StatusBadge status={o.orderStatus} />
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: 'Add Product', href: '/admin/products/new', desc: 'Create new product with variants' },
          { icon: ShoppingCart, label: 'View Orders', href: '/admin/orders', desc: 'Manage customer orders' },
          { icon: FileText, label: 'Write Blog', href: '/admin/blog/new', desc: 'Publish a new blog post' },
          { icon: AlertCircle, label: 'Site Settings', href: '/admin/settings', desc: 'Update business info & content' },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="group rounded-xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-navy">
            <a.icon className="h-8 w-8 text-gold" />
            <p className="mt-3 font-display text-sm font-bold text-navy">{a.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-deep">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    production: 'bg-blue-100 text-blue-800',
    ready: 'bg-purple-100 text-purple-800',
    dispatched: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800',
    cod: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[status] || 'bg-secondary text-foreground'}`}>
      {status}
    </span>
  )
}

'use client'

import * as React from 'react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'
import { TrendingUp, IndianRupee, ShoppingCart, Package, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatINR } from '@/lib/format'
import { Loader2 } from 'lucide-react'

interface Analytics {
  revenueByDay: { date: string; revenue: number; orders: number }[]
  statusData: { name: string; value: number }[]
  paymentData: { name: string; value: number }[]
  topProducts: { name: string; orders: number; revenue: number }[]
  itemsSold: number
  totals: {
    revenue: number; pendingRevenue: number; totalOrders: number; aov: number
    conversionRate: number; paid: number; pending: number; failed: number
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  production: '#3b82f6',
  ready: '#8b5cf6',
  dispatched: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
}
const PAYMENT_COLORS: Record<string, string> = {
  paid: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
  refunded: '#6366f1',
  cod: '#0f1b33',
}

export function AnalyticsCharts() {
  const [data, setData] = React.useState<Analytics | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }
  if (!data) return null

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenue), 1)
  const prev7 = data.revenueByDay.slice(-14, -7).reduce((s, d) => s + d.revenue, 0)
  const last7 = data.revenueByDay.slice(-7).reduce((s, d) => s + d.revenue, 0)
  const revTrend = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : (last7 > 0 ? 100 : 0)

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Revenue (Paid)"
          value={formatINR(data.totals.revenue)}
          icon={IndianRupee}
          trend={revTrend}
          color="bg-green-600"
        />
        <KPICard
          label="Total Orders"
          value={String(data.totals.totalOrders)}
          icon={ShoppingCart}
          sub={`${data.totals.paid} paid · ${data.totals.pending} pending`}
          color="bg-background"
        />
        <KPICard
          label="Avg. Order Value"
          value={formatINR(data.totals.aov)}
          icon={TrendingUp}
          sub={`${data.itemsSold} items sold`}
          color="bg-gold"
        />
        <KPICard
          label="Conversion Rate"
          value={`${data.totals.conversionRate}%`}
          icon={Activity}
          sub="paid / total orders"
          color="bg-purple-600"
        />
      </div>

      {/* Revenue chart */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
          <div>
            <h3 className="font-display text-base font-bold text-navy">Revenue (Last 30 Days)</h3>
            <p className="text-xs text-muted-foreground">Daily revenue from paid orders</p>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-bold text-navy">{formatINR(last7)}</p>
            <p className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${revTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(revTrend)}% vs prev week
            </p>
          </div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#5a5446' }}
                interval={3}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#5a5446' }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f1b33',
                  border: '1px solid #0d9488',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#0d9488', fontWeight: 600 }}
                formatter={(v: any) => [formatINR(v as number), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0d9488"
                strokeWidth={2}
                fill="url(#revGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two-column: status + payment */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-5 py-3">
            <h3 className="font-display text-base font-bold text-navy">Order Status</h3>
            <p className="text-xs text-muted-foreground">Distribution across all orders</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  style={{ fontSize: 11 }}
                >
                  {data.statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f1b33', border: '1px solid #0d9488', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-5 py-3">
            <h3 className="font-display text-base font-bold text-navy">Payment Status</h3>
            <p className="text-xs text-muted-foreground">Paid vs pending vs failed</p>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.paymentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  style={{ fontSize: 11 }}
                >
                  {data.paymentData.map((entry, i) => (
                    <Cell key={i} fill={PAYMENT_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f1b33', border: '1px solid #0d9488', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top products */}
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-secondary/40 px-5 py-3">
          <h3 className="font-display text-base font-bold text-navy">Top Products by Orders</h3>
          <p className="text-xs text-muted-foreground">Most ordered products with revenue contribution</p>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#5a5446' }} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#0f1b33' }}
                width={140}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{ background: '#0f1b33', border: '1px solid #0d9488', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                formatter={(v: any, n: any) => [v, n === 'orders' ? 'Orders' : 'Revenue (₹)']}
              />
              <Bar dataKey="orders" fill="#0f1b33" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
          {data.topProducts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet to display top products.</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function KPICard({
  label, value, icon: Icon, sub, trend, color,
}: {
  label: string
  value: string
  icon: any
  sub?: string
  trend?: number
  color: string
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy truncate">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          {trend !== undefined && (
            <p className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </Card>
  )
}

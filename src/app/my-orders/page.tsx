'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Phone, Mail, Loader2, Package, ChevronRight, Calendar, IndianRupee, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface OrderSummary {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  email?: string | null
  total: number
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  _count: { items: number; files: number }
}

export default function MyOrdersPage() {
  return (
    <StorefrontShell>
      <MyOrdersContent />
    </StorefrontShell>
  )
}

function MyOrdersContent() {
  const [query, setQuery] = React.useState('')
  const [searchType, setSearchType] = React.useState<'phone' | 'email'>('phone')
  const [orders, setOrders] = React.useState<OrderSummary[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      sonnerToast.error(`Please enter your ${searchType}`)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/orders-by-customer?${searchType}=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders(data.items || [])
    } catch (err: any) {
      sonnerToast.error(err.message || 'Lookup failed')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="bg-navy-gradient py-14 text-cream">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Order History</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            My <span className="text-gold-gradient">Orders</span>
          </h1>
          <p className="mt-3 text-lg text-cream/80">Look up all your past orders by phone number or email.</p>
        </div>
        <MandalaDivider className="mt-8 opacity-60" />
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10">
        {/* Search form */}
        <Card className="card-premium overflow-hidden">
          <div className="bg-cream/60 px-6 py-4 border-b border-border">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Search className="h-5 w-5 text-gold" /> Find Your Orders
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the phone number or email you used when placing your order(s).
            </p>
          </div>
          <form onSubmit={handleSearch} className="p-6">
            {/* Toggle phone/email */}
            <div className="mb-3 flex gap-1 rounded-lg border border-border bg-white p-1 w-fit">
              <button
                type="button"
                onClick={() => setSearchType('phone')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  searchType === 'phone' ? 'bg-navy text-cream' : 'text-navy hover:bg-secondary'
                }`}
              >
                <Phone className="h-3.5 w-3.5" /> Phone
              </button>
              <button
                type="button"
                onClick={() => setSearchType('email')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  searchType === 'email' ? 'bg-navy text-cream' : 'text-navy hover:bg-secondary'
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                {searchType === 'phone' ? (
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchType === 'phone' ? 'e.g. 9510737852' : 'e.g. you@example.com'}
                  className="pl-10 border-border text-base"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-cream" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Loading */}
        {loading && (
          <Card className="mt-6 p-10 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Finding your orders...</p>
          </Card>
        )}

        {/* No results */}
        {searched && !loading && orders.length === 0 && (
          <Card className="mt-6 p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-display text-xl font-bold text-navy">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We couldn't find any orders for {searchType === 'phone' ? 'phone' : 'email'}: <strong>{query}</strong>
            </p>
            <div className="mt-4 rounded-md bg-cream/60 p-3 text-xs text-muted-foreground">
              <p>Double-check your {searchType}, or try the other lookup method.</p>
              <p className="mt-2">Need help? Call us at <a href="tel:9510737852" className="font-semibold text-gold-deep">9510737852</a>.</p>
            </div>
          </Card>
        )}

        {/* Results */}
        {searched && !loading && orders.length > 0 && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found <strong className="text-navy">{orders.length}</strong> {orders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden transition hover:shadow-navy">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      order.orderStatus === 'delivered' ? 'bg-green-100 text-green-600' :
                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' :
                      order.orderStatus === 'dispatched' ? 'bg-indigo-100 text-indigo-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <Link href={`/track?o=${order.orderNumber}`} className="font-display text-lg font-bold text-navy hover:text-gold-deep">
                        {order.orderNumber}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>·</span>
                        <span>{order._count.items} {order._count.items === 1 ? 'item' : 'items'}</span>
                        {order._count.files > 0 && (
                          <>
                            <span>·</span>
                            <span>{order._count.files} file{order._count.files === 1 ? '' : 's'}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-navy">{formatINR(order.total)}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-navy/10 text-navy'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="border-navy text-navy">
                      <Link href={`/track?o=${order.orderNumber}`}>
                        Track <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state — before search */}
        {!searched && !loading && (
          <div className="mt-10 text-center">
            <MandalaLogo size={96} className="mx-auto opacity-30" />
            <p className="mt-4 text-sm text-muted-foreground">
              Enter your phone number or email above to see all your orders.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Phone, Loader2, Gift, Star, Award, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { formatINR } from '@/lib/format'
import { toast as sonnerToast } from 'sonner'

interface LoyaltyAccount {
  id: string; phone: string; name?: string | null; email?: string | null
  points: number; totalEarned: number; totalRedeemed: number
  createdAt: string
}
interface RecentOrder {
  orderNumber: string; total: number; orderStatus: string; loyaltyPoints: number; createdAt: string
}

export default function LoyaltyPage() {
  return (
    <StorefrontShell>
      <LoyaltyContent />
    </StorefrontShell>
  )
}

function LoyaltyContent() {
  const [phone, setPhone] = React.useState('')
  const [account, setAccount] = React.useState<LoyaltyAccount | null>(null)
  const [recentOrders, setRecentOrders] = React.useState<RecentOrder[]>([])
  const [loading, setLoading] = React.useState(false)
  const [searched, setSearched] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = phone.trim()
    if (!q) {
      sonnerToast.error('Please enter your phone number')
      return
    }
    setLoading(true)
    setSearched(true)
    setMessage('')
    try {
      const res = await fetch(`/api/loyalty?phone=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAccount(data.account || null)
      setRecentOrders(data.recentOrders || [])
      setMessage(data.message || '')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Lookup failed')
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }

  // 1 point = ₹1 discount. 10 points earned per ₹100 spent (1 pt per ₹10)
  const pointsValue = account ? account.points : 0
  const nextTier = Math.ceil((pointsValue + 1) / 100) * 100

  return (
    <>
      <section className="bg-navy-gradient py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Rewards Program</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            Murlidhar <span className="text-gold-gradient">Loyalty Rewards</span>
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Earn 1 point for every ₹10 you spend. Redeem points for discounts on future orders.
          </p>
        </div>
        <MandalaDivider className="mt-8 opacity-60" />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10">
        {/* How it works */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
              <TrendingUp className="h-6 w-6 text-gold-deep" />
            </div>
            <h3 className="mt-3 font-display text-sm font-bold text-navy">1. Earn Points</h3>
            <p className="mt-1 text-xs text-muted-foreground">Get 1 point per ₹10 spent. Points are added when your order is delivered.</p>
          </Card>
          <Card className="p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
              <Star className="h-6 w-6 text-gold-deep" />
            </div>
            <h3 className="mt-3 font-display text-sm font-bold text-navy">2. Accumulate</h3>
            <p className="mt-1 text-xs text-muted-foreground">Watch your balance grow with every order. 100 points = ₹100 discount.</p>
          </Card>
          <Card className="p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
              <Gift className="h-6 w-6 text-gold-deep" />
            </div>
            <h3 className="mt-3 font-display text-sm font-bold text-navy">3. Redeem</h3>
            <p className="mt-1 text-xs text-muted-foreground">Mention your phone at checkout to apply points as discount.</p>
          </Card>
        </div>

        {/* Search */}
        <Card className="card-premium overflow-hidden">
          <div className="border-b border-border bg-secondary/40 px-6 py-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <Search className="h-5 w-5 text-gold" /> Check Your Points
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Enter the phone number you used when placing orders.</p>
          </div>
          <form onSubmit={handleSearch} className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9510737852"
                  className="pl-10 border-border text-base"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Check Points
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        {loading && (
          <Card className="mt-6 p-10 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Looking up your rewards...</p>
          </Card>
        )}

        {searched && !loading && !account && (
          <Card className="mt-6 p-8 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-display text-xl font-bold text-navy">No rewards account yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {message || `No loyalty account found for phone: ${phone}`}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Place an order and earn points automatically when it's delivered!
            </p>
            <Button asChild className="mt-4 bg-gold text-navy hover:bg-gold-deep hover:text-white">
              <Link href="/shop">Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Card>
        )}

        {searched && !loading && account && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Points balance card */}
            <Card className="overflow-hidden">
              <div className="bg-navy-gradient p-6 text-center text-white">
                <Sparkles className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-2 text-xs uppercase tracking-wide text-white/60">Your Rewards Balance</p>
                <p className="mt-1 font-display text-5xl font-bold text-gold">{account.points}</p>
                <p className="mt-1 text-sm text-white/70">points = {formatINR(account.points)} discount</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                <div className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Lifetime Earned</p>
                  <p className="mt-1 font-display text-xl font-bold text-navy">{account.totalEarned}</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Lifetime Redeemed</p>
                  <p className="mt-1 font-display text-xl font-bold text-navy">{account.totalRedeemed}</p>
                </div>
              </div>
            </Card>

            {/* Account info */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-bold text-navy">{account.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground">{account.phone}</p>
                  {account.email && <p className="text-xs text-muted-foreground">{account.email}</p>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(account.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </Card>

            {/* Recent orders */}
            {recentOrders.length > 0 && (
              <Card className="overflow-hidden">
                <div className="border-b border-border bg-secondary/40 px-5 py-3">
                  <h3 className="font-display text-base font-bold text-navy">Recent Orders</h3>
                </div>
                <ul className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <li key={o.orderNumber} className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <Link href={`/track?o=${o.orderNumber}`} className="font-semibold text-navy hover:text-teal">
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-navy">{formatINR(o.total)}</p>
                        {o.loyaltyPoints > 0 && (
                          <p className="text-xs font-bold text-gold-deep">+{o.loyaltyPoints} pts</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* How to redeem */}
            <Card className="border-gold/30 bg-gold/5 p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-navy">
                <Gift className="h-4 w-4 text-gold" /> How to Redeem Your Points
              </h3>
              <p className="mt-2 text-sm text-foreground/80">
                When placing your next order, simply mention your phone number at checkout or in the remarks field:
                "Apply {account.points} loyalty points (₹{account.points} discount)".
                Our team will verify your balance and apply the discount manually.
              </p>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <div className="mt-10 text-center">
            <MandalaLogo size={96} className="mx-auto opacity-30" />
            <p className="mt-4 text-sm text-muted-foreground">
              Enter your phone number above to check your loyalty points balance.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

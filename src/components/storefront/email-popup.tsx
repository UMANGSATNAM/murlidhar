'use client'

import * as React from 'react'
import { X, Gift, Sparkles, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { toast as sonnerToast } from 'sonner'

const STORAGE_KEY = 'mo-email-popup-shown'
const POPUP_DELAY_MS = 8000 // 8 seconds
const RE_SHOW_DAYS = 30 // re-show after 30 days if not subscribed

export function EmailSubscriptionPopup() {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'subscribed') return // already subscribed, never show
    if (stored) {
      // Check if re-show period passed
      const shownAt = parseInt(stored, 10)
      const daysSince = (Date.now() - shownAt) / (1000 * 60 * 60 * 24)
      if (daysSince < RE_SHOW_DAYS) return
    }
    const t = setTimeout(() => {
      setOpen(true)
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }, POPUP_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sonnerToast.error('Please enter a valid email')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      localStorage.setItem(STORAGE_KEY, 'subscribed')
      sonnerToast.success('🎉 Welcome aboard! Check your inbox.')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    // Mark as shown with current timestamp so it doesn't re-show immediately
    if (localStorage.getItem(STORAGE_KEY) !== 'subscribed') {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else setOpen(o) }}>
      <DialogContent className="max-w-md overflow-hidden !p-0">
        <DialogTitle className="sr-only">Subscribe & Save — Murlidhar Offset Newsletter</DialogTitle>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          // Success state
          <div className="bg-white p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-navy">You're In! 🎉</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks for subscribing! Watch your inbox for exclusive printing tips and seasonal offers.
            </p>
            <Button onClick={handleClose} className="mt-6 w-full bg-gold text-navy hover:bg-gold-deep hover:text-white">
              Continue Browsing
            </Button>
          </div>
        ) : (
          // Form state
          <>
            {/* Top banner with navy gradient */}
            <div className="bg-navy-gradient p-6 text-center text-white">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
                <Gift className="h-7 w-7 text-gold" />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Exclusive Offer</p>
              <h2 className="mt-1 font-display text-2xl font-bold">Get Printing Tips & Offers</h2>
              <p className="mt-2 text-sm text-white/70">
                Join our newsletter and stay updated with seasonal discounts, new product launches, and expert printing tips.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white p-6">
              <ul className="mb-4 space-y-1.5 text-xs text-foreground/70">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> Seasonal discount alerts
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> New product launches
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> Expert printing tips & file prep guides
                </li>
              </ul>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 border-border"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full bg-gold text-navy hover:bg-gold-deep hover:text-white" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gift className="mr-2 h-4 w-4" />}
                  Subscribe Now
                </Button>
              </form>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

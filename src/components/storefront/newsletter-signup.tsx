'use client'

import * as React from 'react'
import { Mail, Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast as sonnerToast } from 'sonner'

export function NewsletterSignup({ variant = 'footer' }: { variant?: 'footer' | 'inline' }) {
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

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
        body: JSON.stringify({ email, name, source: variant }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      sonnerToast.success('🎉 Subscribed! Check your inbox for a welcome email.')
      setEmail('')
      setName('')
    } catch (err: any) {
      sonnerToast.error(err.message || 'Subscription failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`flex items-center gap-3 ${variant === 'footer' ? 'text-foreground' : 'text-navy'}`}>
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <div>
          <p className="text-sm font-semibold">You're subscribed!</p>
          <p className="text-xs opacity-70">We'll send you printing tips & exclusive offers.</p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="ml-auto text-xs underline opacity-70 hover:opacity-100"
        >
          Subscribe another
        </button>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h3 className="font-display text-base font-bold text-navy">Get Printing Tips & Offers</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Join our newsletter — no spam, just useful tips and seasonal discounts.</p>
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="border-border bg-white"
            required
          />
          <Button type="submit" className="bg-background text-foreground hover:bg-secondary/30 shrink-0" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-1.5">Subscribe</span>
          </Button>
        </form>
      </div>
    )
  }

  // Footer variant
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Newsletter</p>
      <p className="text-sm text-muted-foreground">Get printing tips & seasonal offers in your inbox.</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="border-cream/20 bg-cream/10 pl-10 text-foreground placeholder:text-muted-foreground focus:border-gold"
            required
          />
        </div>
        <Button type="submit" size="sm" className="bg-gold text-navy hover:bg-gold-soft" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">We respect your privacy. Unsubscribe anytime.</p>
    </form>
  )
}

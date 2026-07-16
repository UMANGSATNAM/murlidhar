'use client'

import * as React from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    // Check if already accepted
    if (typeof window === 'undefined') return
    const accepted = localStorage.getItem('mo-cookie-consent')
    if (!accepted) {
      // Small delay so it doesn't appear instantly
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('mo-cookie-consent', 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem('mo-cookie-consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 print:hidden">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gold/30 bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20">
            <Cookie className="h-6 w-6 text-gold-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold text-navy">We use cookies</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              We use cookies to improve your experience, remember your cart, and analyse site traffic.
              By continuing to browse, you agree to our use of cookies.{' '}
              <Link href="/faq" className="font-semibold text-gold-deep hover:underline">Learn more</Link>
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button onClick={decline} variant="outline" size="sm" className="border-border text-muted-foreground hover:text-navy">
              Decline
            </Button>
            <Button onClick={accept} size="sm" className="bg-gold text-navy hover:bg-gold-deep hover:text-white">
              Accept All
            </Button>
          </div>
          <button
            onClick={decline}
            className="absolute right-2 top-2 text-muted-foreground hover:text-navy sm:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

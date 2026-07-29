'use client'

import * as React from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'

interface Announcement {
  text: string
  link?: string
  active: boolean
}

export function AnnouncementBar() {
  const [data, setData] = React.useState<Announcement | null>(null)
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    // Check sessionStorage for dismissal in this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('mo-announcement-dismissed') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true)
      return
    }
    fetch('/api/settings')
      .then((r) => r.json())
      .then((s) => {
        if (s?.announcementBar) {
          try {
            const parsed = JSON.parse(s.announcementBar)
            if (parsed.active) setData(parsed)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  const dismiss = () => {
    setDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mo-announcement-dismissed', '1')
    }
  }

  if (!data || dismissed) return null

  return (
    <div className="relative bg-gold-gradient animate-in slide-in-from-top-2 duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 text-center">
        <Sparkles className="hidden h-3.5 w-3.5 shrink-0 text-navy sm:inline" />
        {data.link ? (
          <Link
            href={data.link}
            className="text-xs font-semibold text-navy hover:underline sm:text-sm"
          >
            {data.text}
          </Link>
        ) : (
          <p className="text-xs font-semibold text-navy sm:text-sm">{data.text}</p>
        )}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60 hover:text-navy"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

'use client'

// Back-to-top button — appears after scrolling, smoothly scrolls to top.
import * as React from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-teal shadow-lg transition-all hover:bg-navy-soft hover:scale-110 print:hidden"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}

'use client'

// Floating WhatsApp button — appears bottom-right on all storefront pages.
import * as React from 'react'
import { MessageCircle, X } from 'lucide-react'

export function FloatingWhatsApp() {
  const [open, setOpen] = React.useState(false)
  const [show, setShow] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div className="animate-in slide-in-from-right-4 duration-300 w-72 overflow-hidden rounded-xl border border-green-200 bg-white shadow-2xl">
          <div className="bg-green-600 p-4 text-white">
            <p className="font-semibold">Chat with Murlidhar Offset</p>
            <p className="text-xs text-white/80">Typically replies in minutes</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-foreground/80">
              Hi! 👋 Need help with visiting cards, wedding cards, brochures or any printing? Send us a message on WhatsApp and we'll assist you right away.
            </p>
            <a
              href="https://wa.me/919510737852?text=Hi%20Murlidhar%20Offset,%20I%20have%20a%20question%20about%20your%20printing%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" /> Start Chat
            </a>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">Or call <a href="tel:9510737852" className="font-semibold text-navy">9510737852</a></p>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-600 hover:scale-105"
        aria-label={open ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-green-400 opacity-60" />
        )}
      </button>
    </div>
  )
}

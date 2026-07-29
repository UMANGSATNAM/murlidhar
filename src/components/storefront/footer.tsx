'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle, ArrowUpRight } from 'lucide-react'
import { NewsletterSignup } from './newsletter-signup'

const SERVICES = [
  'Visiting Cards',
  'Letterheads',
  'Bill Books',
  'Flex Banners',
  'Stickers & Labels',
  'Wedding Cards (Kankotri)',
  'Pamphlets & Flyers',
  'Brochures',
  'Packaging Boxes',
]

const QUICK = [
  { href: '/about', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/track', label: 'Track Order' },
  { href: '/my-orders', label: 'My Orders' },
  { href: '/loyalty', label: 'Loyalty Rewards' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/admin', label: 'Admin Login' },
]

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-navy to-navy-deep text-white">
      {/* Gold accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      {/* CTA band */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-2xl font-bold text-white">Ready to print something great?</p>
            <p className="mt-1 text-sm text-white/60">Talk to our team today — we reply within minutes during business hours.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href="https://wa.me/919510737852"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-lg"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Us
            </a>
            <a
              href="tel:9510737852"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Phone className="h-4 w-4" /> 9510737852
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-gold/40 shadow-gold">
              <Image src="/images/brand-logo.jpg" alt="Murlidhar Offset Logo" fill className="object-cover" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">Murlidhar Offset</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400">Unjha · Gujarat</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Family-run printing press serving Unjha & North Gujarat since decades. Quality printing, lasting impression — we print your dreams on paper.
          </p>
          <div className="mt-4 flex gap-2">
            <a href="https://wa.me/919510737852" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-amber-500 hover:text-navy transition">
              <MessageCircle className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-amber-500 hover:text-navy transition">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-amber-500 hover:text-navy transition">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Our Services</h3>
          <ul className="grid gap-1.5 text-sm text-white/60">
            {SERVICES.map((s) => (
              <li key={s}>
                <Link href="/services" className="hover:text-amber-300 transition-colors">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Quick Links</h3>
          <ul className="grid gap-1.5 text-sm text-white/60">
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors">
                  {q.label} <ArrowUpRight className="h-3 w-3 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Get in Touch</h3>
          <ul className="grid gap-3 text-sm text-white/60">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>Shreeji Super Market, 7, Unjha, Gujarat 384170</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <a href="tel:9510737852" className="hover:text-amber-300">9510737852</a>
              <span className="text-white/40">·</span>
              <span>079160 29127</span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <a href="mailto:murlidharoffset84@gmail.com" className="break-all hover:text-amber-300">murlidharoffset84@gmail.com</a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>Open 24 hours · All days</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <NewsletterSignup variant="footer" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Murlidhar Offset. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Powered by <span className="text-amber-400">Konica Minolta AccurioPrint C4065</span> digital press
          </p>
        </div>
      </div>
    </footer>
  )
}

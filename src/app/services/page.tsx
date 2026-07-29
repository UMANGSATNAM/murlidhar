'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  CreditCard, FileText, BookOpen, Printer, Star, HeartHandshake, Newspaper, Folder,
  Sparkles, Calendar, BookMarked, Shirt, PenTool, Package, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { SectionHeader } from '@/components/storefront/section-bits'

const SERVICES = [
  { icon: CreditCard, name: 'Visiting Cards', desc: 'Premium business cards with gold foil, dripoff UV, matt, texture & more finishes. Sold in quantities of 100–1000 pcs.', link: '/shop?category=business-cards', tags: ['Gold Foil', 'Dripoff UV', 'Matt', '350–400 GSM'] },
  { icon: FileText, name: 'Letterheads & Letterpads', desc: 'Crisp professional letterheads on 100 GSM Alabaster, Cedar or Excel Bond paper. Perfect for official correspondence.', link: '/shop?category=letterheads', tags: ['100 GSM', 'Alabaster', 'Bond'] },
  { icon: BookOpen, name: 'Bill Books', desc: 'Custom bill books, invoice books & receipt books with carbon copies, numbered and perforated.', link: '/shop', tags: ['Carbon', 'Numbered', 'Perforated'] },
  { icon: Printer, name: 'Flex Banners', desc: 'Large-format flex banners for promotions, events, birthdays & political campaigns. Weatherproof & vibrant.', link: '/shop', tags: ['Weatherproof', 'Vibrant', 'Large format'] },
  { icon: Star, name: 'Stickers & Labels', desc: 'Custom stickers and product labels in any shape, size and finish. Roll labels, sheet labels, die-cut.', link: '/shop', tags: ['Die-cut', 'Roll', 'Sheet'] },
  { icon: HeartHandshake, name: 'Wedding Cards (Kankotri)', desc: 'Exquisite Gujarati wedding cards with gold foil, traditional motifs and premium finishes.', link: '/shop', tags: ['Gold Foil', 'Traditional', 'Premium'] },
  { icon: Newspaper, name: 'Pamphlets & Flyers', desc: 'High-impact promotional flyers and pamphlets in A5/A4 sizes on 90–170 GSM paper.', link: '/shop?category=pamphlets-flyers', tags: ['A5', 'A4', '90–170 GSM'] },
  { icon: Folder, name: 'Dr. Files & Vyavhar Covers', desc: 'Presentation files, document folders and vyavhar (envelope) covers printed on premium board.', link: '/shop?category=files-folders', tags: ['SBS Board', 'Duplex Board'] },
  { icon: Calendar, name: 'Calendars', desc: 'Table calendars, wall calendars and pocket calendars — perfect New Year corporate gifts.', link: '/shop', tags: ['Table', 'Wall', 'Pocket'] },
  { icon: BookMarked, name: 'Diaries', desc: 'Custom printed diaries and planners for personal, corporate & promotional use.', link: '/shop', tags: ['Planners', 'Corporate'] },
  { icon: BookOpen, name: 'Brochures', desc: 'A3 bifold, A4 trifold and multi-fold brochures with optional Spot UV premium finish.', link: '/shop?category=a3-brochures', tags: ['Bifold', 'Spot UV', 'Premium'] },
  { icon: Shirt, name: 'T-Shirts & Caps', desc: 'Custom screen-printed and heat-transfer t-shirts, caps and uniforms for teams & events.', link: '/shop', tags: ['Screen Print', 'Heat Transfer'] },
  { icon: PenTool, name: 'Logo Design', desc: 'Professional logo design and brand identity development by our in-house design team.', link: '/contact', tags: ['Brand Identity', 'Vector'] },
  { icon: Package, name: 'Packaging Boxes', desc: 'Custom-printed packaging boxes, cartons and pouches for products & gifts.', link: '/shop', tags: ['Custom', 'Cartons'] },
  { icon: Sparkles, name: 'Books & Notebooks', desc: 'Book printing, notebook printing, magazine printing — perfect bound or saddle stitched.', link: '/shop', tags: ['Perfect Bound', 'Saddle Stitch'] },
]

export default function ServicesPage() {
  return (
    <StorefrontShell>
      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-secondary/20 py-14 text-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">What We Print</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            Our <span className="text-gold-gradient">Printing Services</span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">A complete print studio under one roof — from everyday stationery to premium packaging.</p>
        </div>
              </section>

      {/* Services grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {SERVICES.map((s, idx) => {
              // Asymmetric bento sizing: indices 0, 3, 7, 10 are larger, others are square-ish
              const isLarge = [0, 3, 7, 10, 14].includes(idx)
              const colSpanClass = isLarge ? "col-span-2 sm:col-span-2" : "col-span-2 sm:col-span-1"

              return (
                <Link
                  key={s.name}
                  href={s.link}
                  className={`group relative flex ${isLarge ? 'flex-row items-center justify-between' : 'flex-col justify-between'} overflow-hidden rounded-2xl border border-border bg-white p-5 transition-all hover:border-amber-400 hover:shadow-md hover:-translate-y-1 ${colSpanClass}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  
                  <div className={`${isLarge ? 'mb-0' : 'mb-4'}`}>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy transition-transform duration-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-navy">
                      {s.name}
                    </h3>
                    {isLarge && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {s.desc}
                      </p>
                    )}
                    {!isLarge && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded-full bg-secondary/80 px-1.5 py-0.5 text-[9px] font-medium text-navy">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center ${isLarge ? '' : 'w-full justify-end'} relative z-10`}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-white opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="cream-texture py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="How It Works" title="Our Simple 4-Step Process" subtitle="From order to delivery — we make printing effortless." />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '01', title: 'Choose & Customise', desc: 'Browse our catalogue, pick a product, select your variant & quantity.' },
              { step: '02', title: 'Upload Your Design', desc: 'Upload your print-ready file (.cdr/.jpg/.png/.ps/.pdf) or ask our design team.' },
              { step: '03', title: 'We Print & Finish', desc: 'Our Konica Minolta press prints your order with precision finishing.' },
              { step: '04', title: 'Delivery / Pickup', desc: 'Free local delivery in Unjha or pickup from our shop. Pay online / COD / at shop.' },
            ].map((p) => (
              <div key={p.step} className="relative rounded-xl border border-border bg-white p-6">
                <div className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">{p.step}</div>
                <h3 className="mt-3 font-display text-base font-bold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-background to-secondary/20 py-16 text-center text-foreground">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to start your print project?
          </h2>
          <p className="mt-3 text-muted-foreground">Browse our catalogue or call us — we'll guide you to the perfect solution.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-soft">
              <Link href="/shop">Browse Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold/50 text-gold hover:bg-gold hover:text-navy">
              <a href="tel:9510737852">Call 9510737852</a>
            </Button>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}

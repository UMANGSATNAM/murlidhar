'use client'

import * as React from 'react'
import Link from 'next/link'
import { ShieldCheck, Clock, IndianRupee, HeartHandshake, Printer, CheckCircle2, ArrowRight, MapPin, Phone, Mail, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'

const TRUST = [
  { icon: ShieldCheck, title: 'High Quality Printing', desc: 'Konica Minolta AccurioPrint C4065 digital press delivers razor-sharp output every time.' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your deadlines. Most orders ship within 2–4 working days.' },
  { icon: IndianRupee, title: 'Best Price Guarantee', desc: 'Honest, transparent pricing. No hidden charges, no surprises.' },
  { icon: HeartHandshake, title: '100% Customer Satisfaction', desc: 'Family-run business that treats every order with personal care.' },
]

const SERVICES = ['Visiting Cards', 'Letterheads & Letterpads', 'Bill Books', 'Flex Banners', 'Stickers & Labels', 'Wedding Cards (Kankotri)', 'Pamphlets & Flyers', 'Dr. Files', 'Vyavhar Covers', 'Calendars', 'Diaries', 'Brochures', 'T-Shirts', 'Caps', 'Logo Design', 'Packaging Boxes', 'Books & Notebooks']

export default function AboutPage() {
  return (
    <StorefrontShell>
      {/* Hero */}
      <section className="relative bg-navy-gradient py-16 text-cream">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 navy-texture" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-4 flex justify-center"><MandalaLogo size={96} /></div>
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Our Story</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            About <span className="text-gold-gradient">Murlidhar Offset</span>
          </h1>
          <p className="mt-4 text-lg text-cream/80">Quality Printing, Lasting Impression — We Print Your Dreams on Paper</p>
        </div>
        <MandalaDivider className="mt-10 opacity-60" />
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-foreground/80">
              <strong className="text-navy">Murlidhar Offset</strong> is a family-run printing press in the heart of Unjha, Gujarat. For over three decades we have served businesses, families and institutions across North Gujarat with one promise — quality printing, delivered on time, at honest prices.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/80">
              What started as a small letterpress shop has grown into a full-service print studio equipped with a Konica Minolta AccurioPrint C4065 digital press and a complete suite of pre-press, post-press and finishing equipment. We handle everything from a single visiting card to large-volume commercial print runs.
            </p>
            <p className="mt-4 leading-relaxed text-foreground/80">
              Our craft blends traditional Gujarati print sensibility with modern digital precision. Whether it's a wedding kankotri that needs to feel luxurious, a brochure that needs to impress, or a thousand visiting cards that need to arrive on time — we treat every order as if it were our own.
            </p>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="cream-texture py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="Why Customers Trust Us" title="Our Four Promises" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((b, i) => (
              <Card key={b.title} className="card-premium p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold">
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-base font-bold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">0{i + 1}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Our Technology"
                title="Powered by Konica Minolta AccurioPrint C4065"
                subtitle="A production-grade digital press that delivers exceptional colour accuracy, handles heavy stock up to 400 GSM, and prints at speeds that keep our turnaround times industry-leading."
                center={false}
              />
              <ul className="mt-6 space-y-3">
                {['True CMYK colour reproduction with consistent results', 'Support for heavy stock up to 400 GSM — perfect for premium cards', 'Crisp text & fine-line detail at 1200 dpi', 'Fast same-day turnaround on small jobs', 'Minimal paper waste — eco-friendly production'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-gold/30 bg-navy-gradient p-8 text-cream shadow-navy">
              <Printer className="h-16 w-16 text-gold" />
              <h3 className="mt-4 font-display text-2xl font-bold">Konica Minolta AccurioPrint C4065</h3>
              <p className="mt-2 text-sm text-cream/80">
                The AccurioPress C4065 is a colour production printing system that redefines print quality, productivity and media flexibility — enabling us to deliver print-shop-grade results on every single job.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-cream/10 pt-4 text-center">
                <div><p className="font-display text-2xl font-bold text-gold">65</p><p className="text-xs text-cream/60">ppm speed</p></div>
                <div><p className="font-display text-2xl font-bold text-gold">400</p><p className="text-xs text-cream/60">GSM max</p></div>
                <div><p className="font-display text-2xl font-bold text-gold">1200</p><p className="text-xs text-cream/60">dpi</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services strip */}
      <section className="cream-texture py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="What We Do" title="Our Service Range" subtitle="A complete print studio under one roof — from everyday stationery to premium wedding stationery and packaging." />
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {SERVICES.map((s) => (
              <span key={s} className="rounded-full border border-gold/30 bg-white px-4 py-1.5 text-sm font-medium text-navy">{s}</span>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild className="bg-navy text-cream hover:bg-navy-soft">
              <Link href="/services">View Detailed Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact / Map */}
      <section className="bg-navy-gradient py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader eyebrow="Visit Us" title="Find Us in Unjha" light />
          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-cream/15 bg-cream/5 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream/60">Address</p>
                  <p className="font-display text-base font-bold text-cream">Shreeji Super Market, 7, Unjha, Gujarat 384170</p>
                  <p className="text-xs text-cream/60">Open 24 hours · All days of the week</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-cream/15 bg-cream/5 p-4">
                <Phone className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream/60">Call us</p>
                  <a href="tel:9510737852" className="font-display text-base font-bold text-cream hover:text-gold">9510737852</a>
                  <span className="text-cream/40"> · </span>
                  <span className="text-sm text-cream/80">079160 29127</span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-cream/15 bg-cream/5 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream/60">Email</p>
                  <a href="mailto:murlidharoffset84@gmail.com" className="font-display text-base font-bold text-cream hover:text-gold">murlidharoffset84@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-cream/15 bg-cream/5 p-4">
                <Star className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream/60">Google Rating</p>
                  <p className="font-display text-base font-bold text-cream">5.0 ★ · Based on customer reviews</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-gold/30 shadow-2xl">
              <iframe
                title="Murlidhar Offset location"
                src="https://www.google.com/maps?q=Unjha,Gujarat,384170&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}

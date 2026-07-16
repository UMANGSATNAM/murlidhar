'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  IndianRupee,
  HeartHandshake,
  CreditCard,
  FileText,
  Mail,
  Newspaper,
  BookOpen,
  Folder,
  Printer,
  Star,
  Quote,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell, StarRating } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { RecentlyViewed } from '@/components/storefront/recently-viewed'
import { NewsletterSignup } from '@/components/storefront/newsletter-signup'
import { FeaturedBundles } from '@/components/storefront/featured-bundles'
import { formatINR } from '@/lib/format'

interface Banner {
  id: string
  title?: string
  subtitle?: string
  imageUrl: string
  link?: string
}
interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  _count?: { products: number }
}
interface Product {
  id: string
  name: string
  slug: string
  shortDesc?: string
  basePrice: number
  rating: number
  reviewCount: number
  images: { url: string; alt?: string }[]
  category?: { name: string; slug: string }
}
interface Testimonial {
  id: string
  name: string
  location?: string
  rating: number
  text: string
}
interface Settings {
  businessName: string
  tagline: string
  phone: string
  email: string
  address: string
  hours: string
  mapEmbedUrl?: string
  whatsapp?: string
}

const CATEGORY_ICONS: Record<string, any> = {
  CreditCard,
  FileText,
  Mail,
  Newspaper,
  BookOpen,
  Folder,
}

const SERVICES = [
  { icon: CreditCard, name: 'Visiting Cards' },
  { icon: FileText, name: 'Letterheads & Letterpads' },
  { icon: BookOpen, name: 'Bill Books' },
  { icon: Printer, name: 'Flex Banners' },
  { icon: Star, name: 'Stickers & Labels' },
  { icon: HeartHandshake, name: 'Wedding Cards (Kankotri)' },
  { icon: Newspaper, name: 'Pamphlets & Flyers' },
  { icon: Folder, name: 'Dr. Files & Vyavhar Covers' },
  { icon: BookOpen, name: 'Calendars & Diaries' },
  { icon: FileText, name: 'Brochures' },
  { icon: Sparkles, name: 'T-Shirts & Caps' },
  { icon: Star, name: 'Logo Design' },
  { icon: Folder, name: 'Packaging Boxes' },
  { icon: BookOpen, name: 'Books & Notebooks' },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, title: 'High Quality Printing', desc: 'Konica Minolta AccurioPrint C4065 digital press for razor-sharp output every single time.' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'We respect your deadlines. Most orders ship within 2–4 working days, every time.' },
  { icon: IndianRupee, title: 'Best Price Guarantee', desc: 'Honest, transparent pricing. No hidden charges, no surprises — just great value.' },
  { icon: HeartHandshake, title: '100% Satisfaction', desc: 'Family-run business that treats every order with personal care. Your trust is our reputation.' },
]

export default function HomePage() {
  const [banners, setBanners] = React.useState<Banner[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([])
  const [settings, setSettings] = React.useState<Settings | null>(null)
  const [heroIdx, setHeroIdx] = React.useState(0)

  React.useEffect(() => {
    Promise.all([
      fetch('/api/banners').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products?featured=true&pageSize=8').then((r) => r.json()),
      fetch('/api/testimonials').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]).then(([b, c, p, t, s]) => {
      setBanners(b.items || [])
      setCategories(c.items || [])
      setProducts(p.items || [])
      setTestimonials(t.items || [])
      setSettings(s)
    })
  }, [])

  // Hero slider auto-advance
  React.useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % banners.length), 5500)
    return () => clearInterval(id)
  }, [banners.length])

  return (
    <StorefrontShell>
      {/* ─── HERO SLIDER ─────────────────────────────────────────────────────── */}
      <section className="relative bg-navy-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute inset-0 navy-texture" />
        </div>
        {/* Decorative gold corner flourishes */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute left-4 top-4 h-16 w-16 border-l-2 border-t-2 border-gold/40" />
          <div className="absolute right-4 top-4 h-16 w-16 border-r-2 border-t-2 border-gold/40" />
          <div className="absolute bottom-4 left-4 h-16 w-16 border-b-2 border-l-2 border-gold/40" />
          <div className="absolute bottom-4 right-4 h-16 w-16 border-b-2 border-r-2 border-gold/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-16 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Left — copy */}
            <div className="text-cream">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <Sparkles className="h-3 w-3" /> Since decades · Unjha, Gujarat
              </div>
              <h1
                className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                We Print Your
                <br />
                <span className="text-gold-gradient">Dreams on Paper</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
                Premium printing press in Unjha, Gujarat. Visiting cards, wedding cards, brochures, banners & more — crafted with precision on our Konica Minolta AccurioPrint C4065 digital press.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-gold text-navy hover:bg-gold-soft hover:text-navy">
                  <Link href="/shop">
                    Explore Shop <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-gold/50 text-gold hover:bg-gold hover:text-navy">
                  <Link href="/services">View Services</Link>
                </Button>
              </div>
              {/* Mini trust stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-cream/10 pt-6">
                <div>
                  <p className="font-display text-2xl font-bold text-gold">5.0★</p>
                  <p className="text-xs text-cream/60">Google Rating</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gold">30+</p>
                  <p className="text-xs text-cream/60">Years of Craft</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-gold">10k+</p>
                  <p className="text-xs text-cream/60">Orders Delivered</p>
                </div>
              </div>
            </div>

            {/* Right — hero image slider */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-gold/30 shadow-2xl">
                {banners.length > 0 ? (
                  banners.map((b, i) => (
                    <div
                      key={b.id}
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        i === heroIdx ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      { }
                      <img
                        src={b.imageUrl}
                        alt={b.title || 'Murlidhar Offset'}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
                      {b.title && (
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-cream">
                          <p className="font-display text-lg font-semibold text-gold-soft">{b.title}</p>
                          {b.subtitle && (
                            <p className="mt-1 line-clamp-2 text-sm text-cream/80">{b.subtitle}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex h-full items-center justify-center bg-navy-soft">
                    <MandalaLogo size={120} />
                  </div>
                )}
              </div>

              {/* Slider controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={() => setHeroIdx((i) => (i - 1 + banners.length) % banners.length)}
                    className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 text-cream backdrop-blur transition hover:bg-gold hover:text-navy"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setHeroIdx((i) => (i + 1) % banners.length)}
                    className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy/60 text-cream backdrop-blur transition hover:bg-gold hover:text-navy"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute -bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIdx(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === heroIdx ? 'w-8 bg-gold' : 'w-2 bg-secondary/30 hover:bg-cream/70'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <MandalaDivider className="opacity-60" />
      </section>

      {/* ─── ABOUT BAND ───────────────────────────────────────────────────────── */}
      <section className="cream-texture py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                eyebrow="About Murlidhar Offset"
                title="A Family-Run Print Studio Rooted in Unjha"
                subtitle="For over three decades, Murlidhar Offset has served businesses, families and institutions across North Gujarat with one promise — quality printing, delivered on time, at honest prices."
                center={false}
              />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {TRUST_BADGES.map((b) => (
                  <div key={b.title} className="flex gap-3 rounded-lg border border-border bg-white p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy text-gold">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">{b.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-6 bg-navy text-cream hover:bg-navy-soft">
                <Link href="/about">
                  Read Our Story <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Machine showcase card */}
            <div className="relative">
              <div className="card-premium overflow-hidden rounded-2xl shadow-navy">
                <div className="bg-navy-gradient p-6 text-cream">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold/20">
                      <Printer className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Our Technology</p>
                      <p className="font-display text-lg font-bold">Konica Minolta AccurioPrint C4065</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-cream/80">
                    A production-grade digital press that delivers exceptional colour accuracy, handles heavy stock up to 400 GSM, and prints at speeds that keep our turnaround times industry-leading.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-cream/90">
                    {['True CMYK colour reproduction', 'Up to 400 GSM stock support', 'Crisp text & fine-line detail', 'Fast same-day turnaround on small jobs'].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-gold" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED CATEGORIES ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Browse Our Catalogue"
            title="Featured Categories"
            subtitle="From a single visiting card to large-volume commercial print runs — explore our most popular product categories."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => {
              const Icon = CATEGORY_ICONS[cat.icon || ''] || Printer
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-navy"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gold/10 transition-transform group-hover:scale-150" />
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-gold transition-colors group-hover:bg-gold group-hover:text-navy">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-navy">{cat.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {cat.description || `Premium ${cat.name.toLowerCase()} printed on quality stock.`}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gold-deep">
                        {cat._count?.products ?? 0} products
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-navy transition-transform group-hover:translate-x-1">
                        Explore <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <MandalaDivider />

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────────────── */}
      <section className="cream-texture py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Best Sellers"
            title="Featured Products"
            subtitle="Hand-picked printing solutions our customers love — each crafted with attention to detail."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="border-navy text-navy hover:bg-navy hover:text-cream">
              <Link href="/shop">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FEATURED BUNDLES ──────────────────────────────────────────────────── */}
      <FeaturedBundles />

      {/* ─── WHY CHOOSE US ────────────────────────────────────────────────────── */}
      <section className="bg-navy-gradient py-16 sm:py-20 text-cream">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Our Promise"
            title="Why Choose Murlidhar Offset"
            subtitle="Four reasons businesses and families across North Gujarat trust us with their printing needs."
            light
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_BADGES.map((b, i) => (
              <div
                key={b.title}
                className="group relative overflow-hidden rounded-xl border border-gold/20 bg-white/5 p-6 text-center backdrop-blur transition hover:border-gold/50 hover:bg-cream/10"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold transition group-hover:scale-110">
                  <b.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-bold text-cream">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{b.desc}</p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">
                  0{i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES STRIP ───────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="What We Print"
            title="Our Complete Service Range"
            subtitle="A full-service print studio — from everyday business stationery to premium wedding stationery and packaging."
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-white p-4 text-center transition hover:border-gold hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-navy transition group-hover:bg-gold">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-navy">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="link" className="text-gold-deep">
              <Link href="/services">
                See detailed service breakdown <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <MandalaDivider />

      {/* ─── RECENTLY VIEWED ──────────────────────────────────────────────────── */}
      <RecentlyViewed />

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="cream-texture py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Customer Love"
            title="What Our Customers Say"
            subtitle="Real reviews from real customers across North Gujarat."
          />
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-gold/30 bg-white px-6 py-3 shadow-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <span className="font-display text-2xl font-bold text-navy">5.0</span>
              <span className="text-sm text-muted-foreground">· Based on Google reviews</span>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <Card key={t.id} className="card-premium relative p-6">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-gold/20" />
                <StarRating rating={t.rating} size={16} showCount={false} />
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display font-bold text-gold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER CTA ──────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <NewsletterSignup variant="inline" />
        </div>
      </section>

      {/* ─── CONTACT CTA BAND ─────────────────────────────────────────────────── */}
      <section className="bg-navy-gradient py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeader
                eyebrow="Get in Touch"
                title="Visit Us or Call — We're Open 24 Hours"
                subtitle="Drop by our shop in Unjha, or call/WhatsApp us anytime. We respond within minutes during business hours."
                light
              />
              <div className="mt-6 grid gap-3">
                <a href="tel:9510737852" className="flex items-center gap-4 rounded-lg border border-white/15 bg-white/5 p-4 transition hover:border-gold/50 hover:bg-cream/10">
                  <Phone className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cream/60">Call us</p>
                    <p className="font-display text-lg font-bold text-cream">9510737852 · 079160 29127</p>
                  </div>
                </a>
                <a href="mailto:murlidharoffset84@gmail.com" className="flex items-center gap-4 rounded-lg border border-white/15 bg-white/5 p-4 transition hover:border-gold/50 hover:bg-cream/10">
                  <Mail className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cream/60">Email</p>
                    <p className="font-display text-lg font-bold text-cream">murlidharoffset84@gmail.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 rounded-lg border border-white/15 bg-white/5 p-4">
                  <MapPin className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-cream/60">Visit our shop</p>
                    <p className="font-display text-base font-bold text-cream">Shreeji Super Market, 7, Unjha, Gujarat 384170</p>
                    <p className="text-xs text-cream/60">{settings?.hours || 'Open 24 hours'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map embed */}
            <div className="overflow-hidden rounded-2xl border-2 border-gold/30 shadow-2xl">
              <iframe
                title="Murlidhar Offset location"
                src={settings?.mapEmbedUrl || 'https://www.google.com/maps?q=Unjha,Gujarat,384170&output=embed'}
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

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const img = product.images?.[0]?.url
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-all hover:-translate-y-1 hover:shadow-navy"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {img ? (
           
          <img
            src={img}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Printer className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-navy/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream backdrop-blur">
            {product.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold leading-snug text-navy line-clamp-2">
          {product.name}
        </h3>
        {product.shortDesc && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.shortDesc}</p>
        )}
        <div className="mt-2">
          <StarRating rating={product.rating} count={product.reviewCount} size={13} />
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Starting from</p>
            <p className="font-display text-lg font-bold text-navy">{formatINR(product.basePrice)}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-navy transition group-hover:bg-gold">
            View <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

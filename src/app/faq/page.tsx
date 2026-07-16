'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle, MessageCircle, Phone, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface FAQ { q: string; a: string }

export default function FAQPage() {
  const [faqs, setFaqs] = React.useState<FAQ[]>([])
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => setFaqs(d.items || []))
      .finally(() => setLoading(false))
  }, [])

  // JSON-LD FAQ structured data for Google rich results
  const jsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <StorefrontShell>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <section className="bg-navy-gradient py-14 text-cream">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Help Center</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            Frequently Asked <span className="text-gold-gradient">Questions</span>
          </h1>
          <p className="mt-3 text-lg text-cream/80">Quick answers to common questions about our printing services.</p>
        </div>
        <MandalaDivider className="mt-8 opacity-60" />
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions... (e.g. 'delivery', 'payment', 'file format')"
            className="pl-10 border-border bg-white"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 font-display text-lg font-bold text-navy">No matching questions</p>
            <p className="text-sm text-muted-foreground">Try a different search term or contact us directly.</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
                  <AccordionTrigger className="px-5 py-4 text-left font-display text-base font-bold text-navy hover:no-underline hover:bg-cream/40">
                    <span className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold-deep">
                        {i + 1}
                      </span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pl-14 text-sm leading-relaxed text-foreground/80">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}

        {/* Still have questions CTA */}
        <Card className="mt-8 overflow-hidden">
          <div className="bg-navy-gradient p-6 text-center text-cream">
            <h3 className="font-display text-xl font-bold">Still have questions?</h3>
            <p className="mt-1 text-sm text-cream/70">Our team is available 24 hours to help you.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a href="tel:9510737852" className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-soft">
                <Phone className="h-4 w-4" /> Call 9510737852
              </a>
              <a href="https://wa.me/919510737852" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cream/30 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-cream/10">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <Button asChild variant="outline" className="border-gold/50 text-gold hover:bg-gold hover:text-navy">
                <Link href="/contact">Contact Form <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </StorefrontShell>
  )
}

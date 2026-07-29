'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '@/components/storefront/section-bits'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface FAQ { q: string; a: string }

export function ProductFAQ() {
  const [faqs, setFaqs] = React.useState<FAQ[]>([])

  React.useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => setFaqs((d.items || []).slice(0, 4)))
      .catch(() => {})
  }, [])

  if (faqs.length === 0) return null

  return (
    <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader eyebrow="Good to Know" title="Quick Questions" center={false} />
        <Button asChild variant="link" className="text-gold-deep">
          <Link href="/faq">View all FAQs <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
      <Card className="mt-6 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-0">
              <AccordionTrigger className="px-5 py-3 text-left text-sm font-semibold text-navy hover:no-underline hover:bg-secondary/30">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-3 text-xs leading-relaxed text-foreground/80">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </section>
  )
}

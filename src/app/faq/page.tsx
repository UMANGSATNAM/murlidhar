import type { Metadata } from 'next'
import { db } from '@/lib/db'
import FAQClient from './faq-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FAQ — Murlidhar Offset | Printing Questions Answered',
  description:
    'Find answers to common questions about Murlidhar Offset printing services — file formats, turnaround times, delivery, payment methods, design services and more.',
  keywords: ['printing FAQ', 'printing questions', 'Murlidhar Offset', 'Unjha printing', 'visiting card FAQ'],
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Murlidhar Offset',
    description: 'Answers to common printing questions — file formats, delivery, payment, and more.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Murlidhar Offset',
  },
}

export default async function Page() {
  // Fetch FAQs server-side for SEO crawlers
  const settings = await db.siteSettings.findUnique({
    where: { id: 'default' },
    select: { faq: true },
  })
  let faqs: { q: string; a: string }[] = []
  if (settings?.faq) {
    try {
      faqs = JSON.parse(settings.faq)
    } catch {
      faqs = []
    }
  }

  return <FAQClient faqs={faqs} />
}

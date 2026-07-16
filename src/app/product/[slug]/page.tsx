import type { Metadata } from 'next'
import { db } from '@/lib/db'
import ProductDetailClient from './product-client'

export const dynamic = 'force-dynamic'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' }, take: 1 },
    },
  })

  if (!product) {
    return {
      title: 'Product Not Found — Murlidhar Offset',
      description: 'The requested product could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const title = `${product.name} — Murlidhar Offset | Unjha, Gujarat`
  const description =
    product.shortDesc ||
    `Order ${product.name} online from Murlidhar Offset. Premium printing in Unjha, Gujarat with on-time delivery and best price guarantee.`

  const imageUrl = product.images[0]?.url
    ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${product.images[0].url}`
    : undefined

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category?.name || 'printing',
      'printing press Unjha',
      'Murlidhar Offset',
      'buy online',
      'Gujarat printing',
      product.category?.slug || '',
    ].filter(Boolean),
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_IN',
      siteName: 'Murlidhar Offset',
      url: `/product/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: product.active ? { index: true, follow: true } : { index: false, follow: false },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, images: { orderBy: { order: 'asc' }, take: 1 } },
  })

  // JSON-LD structured data for Google rich results
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDesc || product.description || product.name,
        image: product.images[0]?.url
          ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${product.images[0].url}`
          : undefined,
        sku: product.slug,
        brand: { '@type': 'Brand', name: 'Murlidhar Offset' },
        category: product.category?.name,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
        offers: {
          '@type': 'Offer',
          price: product.basePrice,
          priceCurrency: 'INR',
          availability: product.active
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: { '@type': 'Organization', name: 'Murlidhar Offset' },
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  )
}

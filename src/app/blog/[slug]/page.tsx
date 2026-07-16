import type { Metadata } from 'next'
import { db } from '@/lib/db'
import BlogPostClient from './blog-client'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await db.blogPost.findUnique({ where: { slug } })

  if (!post || !post.published) {
    return {
      title: 'Article Not Found — Murlidhar Offset',
      description: 'The requested article could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const title = `${post.title} — Murlidhar Offset Blog`
  const description = post.excerpt || `${post.title} — insights from Murlidhar Offset, a premium printing press in Unjha, Gujarat.`
  const imageUrl = post.featuredImage
    ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${post.featuredImage}`
    : undefined

  return {
    title,
    description,
    keywords: post.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'en_IN',
      siteName: 'Murlidhar Offset',
      url: `/blog/${post.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
      publishedTime: post.createdAt.toISOString(),
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    robots: { index: true, follow: true },
  }
}

export default function Page() {
  return <BlogPostClient />
}

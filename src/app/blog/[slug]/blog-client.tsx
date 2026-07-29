'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Calendar, User, ArrowLeft, ArrowRight, ChevronRight, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import {  } from '@/components/storefront/section-bits'
import { MandalaLogo } from '@/components/storefront/mandala-logo'
import { BlogContent } from '@/components/storefront/blog-content'

interface Post {
  id: string; title: string; slug: string; excerpt?: string; content: string
  featuredImage?: string; tags?: string; author?: string; createdAt: string
}

export default function BlogPostClient() {
  return (
    <StorefrontShell>
      <BlogPostContent />
    </StorefrontShell>
  )
}

function BlogPostContent() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = React.useState<Post | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)

  React.useEffect(() => {
    if (!slug) return
    fetch(`/api/blog?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setPost(d.post))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <div className="aspect-[16/9] animate-pulse rounded-xl bg-secondary" />
        <div className="mt-6 space-y-3">
          <div className="h-8 w-3/4 animate-pulse rounded bg-secondary" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-secondary" />
          <div className="h-24 w-full animate-pulse rounded bg-secondary" />
        </div>
      </div>
    )
  }
  if (notFound || !post) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <MandalaLogo size={96} />
        <h1 className="font-display text-2xl font-bold text-navy">Article not found</h1>
        <Button asChild className="bg-background text-foreground hover:bg-secondary/30">
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-navy">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-navy">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="line-clamp-1 text-navy">{post.title}</span>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <header className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            {post.author && <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>}
            {post.tags && post.tags.split(',').map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 font-medium text-navy">{t.trim()}</span>
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight text-navy sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border shadow-sm">
            { }
            <Image src={post.featuredImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
          </div>
        )}

        {/* Content */}
        <BlogContent content={post.content} />

        
        {/* Footer CTA */}
        <Card className="bg-gradient-to-b from-background to-secondary/20 p-6 text-center text-foreground">
          <h3 className="font-display text-xl font-bold">Need help with your next print project?</h3>
          <p className="mt-2 text-sm text-muted-foreground">Our team is just a call away — open 24 hours.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild className="bg-gold text-navy hover:bg-gold-soft">
              <Link href="/shop">Browse Shop <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="border-gold/50 text-gold hover:bg-gold hover:text-navy">
              <a href="tel:9510737852">Call Us</a>
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Button asChild variant="ghost" className="text-navy">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all articles</Link>
          </Button>
        </div>
      </article>
    </>
  )
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Calendar, ArrowRight, User, PenTool } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { MandalaDivider, SectionHeader } from '@/components/storefront/section-bits'

interface Post {
  id: string; title: string; slug: string; excerpt?: string
  featuredImage?: string; tags?: string; author?: string; createdAt: string
}

export default function BlogPage() {
  const [posts, setPosts] = React.useState<Post[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/blog').then((r) => r.json()).then((d) => {
      setPosts(d.items || [])
      setLoading(false)
    })
  }, [])

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <StorefrontShell>
      <section className="bg-navy-gradient py-14 text-cream">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Insights & Tips</span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            The Murlidhar <span className="text-gold-gradient">Print Journal</span>
          </h1>
          <p className="mt-3 text-lg text-cream/80">Printing tips, design guides and stories from our studio.</p>
        </div>
        <MandalaDivider className="mt-8 opacity-60" />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="aspect-[16/9] animate-pulse bg-secondary" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-secondary" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-secondary" />
                  <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-20 text-center">
            <p className="font-display text-xl font-bold text-navy">No blog posts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for printing tips and stories.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group mb-10 block overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-navy">
                <div className="grid lg:grid-cols-2">
                  <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-secondary">
                    {featured.featuredImage ? (
                       
                      <img src={featured.featuredImage} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : null}
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 font-bold text-gold-deep">FEATURED</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {featured.author && <span className="flex items-center gap-1"><User className="h-3 w-3" />{featured.author}</span>}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-navy group-hover:text-gold-deep sm:text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{featured.excerpt}</p>}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-deep">
                      Read Article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Rest */}
            {rest.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition hover:-translate-y-1 hover:shadow-navy">
                    <div className="aspect-[16/9] overflow-hidden bg-secondary">
                      {p.featuredImage && (
                         
                        <img src={p.featuredImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.author && <><span>·</span><PenTool className="h-3 w-3" />{p.author}</>}
                      </div>
                      <h3 className="font-display text-lg font-bold leading-snug text-navy group-hover:text-gold-deepline-clamp-2">
                        {p.title}
                      </h3>
                      {p.excerpt && <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-deep">
                        Read More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </StorefrontShell>
  )
}

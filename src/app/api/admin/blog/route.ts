import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const items = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { title, slug, excerpt, content, featuredImage, tags, published, author } = body
  if (!title) return Response.json({ error: 'title required' }, { status: 400 })
  const finalSlug = slug ? slugify(slug) : slugify(title) + '-' + Date.now().toString(36)
  const post = await db.blogPost.create({
    data: { title, slug: finalSlug, excerpt, content, featuredImage, tags, published: published ?? false, author },
  })
  return Response.json({ ok: true, post })
}

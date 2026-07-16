import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const body = await request.json()
  const { id, title, slug, excerpt, content, featuredImage, tags, published, author } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const existing = await db.blogPost.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  const updated = await db.blogPost.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      slug: slug ? slugify(slug) : existing.slug,
      excerpt: excerpt ?? existing.excerpt,
      content: content ?? existing.content,
      featuredImage: featuredImage ?? existing.featuredImage,
      tags: tags ?? existing.tags,
      published: published ?? existing.published,
      author: author ?? existing.author,
    },
  })
  return Response.json({ ok: true, post: updated })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  await db.blogPost.delete({ where: { id } })
  return Response.json({ ok: true })
}

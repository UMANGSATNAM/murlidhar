import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const post = await db.blogPost.findUnique({ where: { slug } })
    if (!post || !post.published) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({ post })
  }

  const posts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json({ items: posts })
}

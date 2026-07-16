import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/reviews?productId=xxx — public list of approved reviews for a product
// POST /api/reviews — submit a new review (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  if (!productId) return Response.json({ error: 'productId required' }, { status: 400 })

  try {
    const reviews = await db.productReview.findMany({
      where: { productId, active: true },
      orderBy: { createdAt: 'desc' },
    })

    // Compute aggregate rating
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

    return Response.json({ items: reviews, average: avg, count: reviews.length })
  } catch {
    // Invalid productId (FK violation) → return empty
    return Response.json({ items: [], average: 0, count: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, email, rating, title, comment } = body
    if (!productId || !name || !comment || !rating) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }
    const review = await db.productReview.create({
      data: {
        productId,
        name: String(name).slice(0, 100),
        email: email ? String(email).slice(0, 200) : null,
        rating: parseInt(rating, 10),
        title: title ? String(title).slice(0, 200) : null,
        comment: String(comment).slice(0, 2000),
        active: false, // require admin moderation by default
      },
    })
    return Response.json({ ok: true, review })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

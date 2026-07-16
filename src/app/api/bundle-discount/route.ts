import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST /api/bundle-discount
// Body: { bundleIds: string[] }
// Returns: { bundles: [{ id, name, originalPrice, bundlePrice, savings }], totalSavings: number }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bundleIds } = body
    if (!bundleIds || !Array.isArray(bundleIds) || bundleIds.length === 0) {
      return Response.json({ bundles: [], totalSavings: 0 })
    }

    const bundles = await db.productBundle.findMany({
      where: { id: { in: bundleIds }, active: true },
      select: { id: true, name: true, originalPrice: true, bundlePrice: true, savings: true },
    })

    const totalSavings = bundles.reduce((s, b) => s + b.savings, 0)

    return Response.json({
      bundles: bundles.map((b) => ({
        id: b.id,
        name: b.name,
        originalPrice: b.originalPrice,
        bundlePrice: b.bundlePrice,
        savings: b.savings,
      })),
      totalSavings,
    })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

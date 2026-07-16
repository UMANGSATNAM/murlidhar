// Admin API guard — returns admin or null. Use in route handlers.
import { getAdminFromRequest } from '@/lib/auth'
import { db } from '@/lib/db'

export async function requireAdmin(request: Request) {
  const admin = await getAdminFromRequest(request)
  return admin
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}

// Helper to fetch a product with full variant tree for storefront or admin
export async function fetchProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } },
      attributes: {
        orderBy: { order: 'asc' },
        include: { options: { orderBy: { order: 'asc' } } },
      },
      variants: {
        include: {
          options: { include: { option: { include: { attribute: true } } } },
        },
      },
    },
  })
}

export type ProductWithVariants = Awaited<ReturnType<typeof fetchProductBySlug>>

// Build a clean variant summary string from a ProductVariant (with options loaded)
export function variantSummary(variant: {
  options?: { option: { value: string; attribute?: { name: string } } }[]
}): string {
  if (!variant.options || variant.options.length === 0) return ''
  return variant.options
    .map((o) => o.option.value)
    .join(' · ')
}

// Find a matching variant given selected options (map of attrName -> value)
export function findVariant(
  product: NonNullable<ProductWithVariants>,
  selection: Record<string, string>
) {
  return product.variants.find((v) => {
    const matches = v.options.every((vo) => {
      const attrName = vo.option.attribute?.name
      if (!attrName) return false
      return selection[attrName] === vo.option.value
    })
    return matches
  })
}

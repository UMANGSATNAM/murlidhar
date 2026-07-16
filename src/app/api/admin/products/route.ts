import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

// List all products (admin sees inactive too)
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))

  const where: any = {}
  if (q) {
    where.OR = [{ name: { contains: q } }, { slug: { contains: q } }]
  }
  if (category) where.categoryId = category

  const [total, products] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        _count: { select: { variants: true } },
      },
    }),
  ])

  return Response.json({ items: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
}

// Create product (with optional images + variant matrix)
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { name, slug, shortDesc, description, categoryId, basePrice, featured, active, turnaroundNote, rating, reviewCount, images, attributes, variants } = body

  if (!name || !categoryId) return Response.json({ error: 'name and categoryId required' }, { status: 400 })

  const finalSlug = slug ? slugify(slug) : slugify(name) + '-' + Date.now().toString(36)

  const product = await db.product.create({
    data: {
      name,
      slug: finalSlug,
      shortDesc,
      description,
      categoryId,
      basePrice: basePrice || 0,
      featured: featured ?? false,
      active: active ?? true,
      turnaroundNote,
      rating: rating ?? 5,
      reviewCount: reviewCount ?? 0,
      images: images?.length
        ? { create: images.map((img: any, i: number) => ({ url: img.url, alt: img.alt || name, order: i })) }
        : undefined,
    },
    include: { images: true },
  })

  // Build variant attributes & options
  if (attributes?.length) {
    for (let ai = 0; ai < attributes.length; ai++) {
      const attr = attributes[ai]
      const created = await db.variantAttribute.create({
        data: { productId: product.id, name: attr.name, order: ai },
      })
      const optMap: Record<string, string> = {}
      for (let oi = 0; oi < attr.options.length; oi++) {
        const opt = await db.variantOption.create({
          data: { attributeId: created.id, value: attr.options[oi], order: oi },
        })
        optMap[attr.options[oi]] = opt.id
      }
      // store on attr for variant building
      ;(attr as any)._id = created.id
      ;(attr as any)._optMap = optMap
    }
  }

  // Build variants
  if (variants?.length) {
    for (const v of variants) {
      const variant = await db.productVariant.create({
        data: { productId: product.id, price: v.price, sku: v.sku, stock: v.stock ?? 0 },
      })
      // v.options is a map of attrName -> optionValue
      for (const [attrName, optVal] of Object.entries(v.options || {})) {
        const attr = attributes.find((a: any) => a.name === attrName)
        if (attr) {
          const optId = (attr as any)._optMap?.[optVal as string]
          if (optId) {
            await db.productVariantOption.create({
              data: { variantId: variant.id, optionId: optId },
            })
          }
        }
      }
    }
  }

  // Recompute basePrice if variants exist
  if (variants?.length) {
    const minPrice = Math.min(...variants.map((v: any) => v.price))
    await db.product.update({ where: { id: product.id }, data: { basePrice: minPrice } })
  }

  return Response.json({ ok: true, product })
}

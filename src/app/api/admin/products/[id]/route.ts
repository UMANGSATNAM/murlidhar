import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorized, fetchProductBySlug } from '@/lib/api-helpers'
import { slugify } from '@/lib/format'

export const dynamic = 'force-dynamic'

// Get single product (admin, full detail incl. inactive)
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (id) {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        attributes: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
        variants: {
          include: { options: { include: { option: { include: { attribute: true } } } } },
        },
      },
    })
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ product })
  }
  return Response.json({ error: 'id required' }, { status: 400 })
}

// Update product (full replace of attributes & variants)
export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const body = await request.json()
  const { id, name, slug, shortDesc, description, categoryId, basePrice, featured, active, turnaroundNote, rating, reviewCount, images, attributes, variants } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })

  const finalSlug = slug ? slugify(slug) : existing.slug

  await db.product.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug: finalSlug,
      shortDesc: shortDesc ?? existing.shortDesc,
      description: description ?? existing.description,
      categoryId: categoryId ?? existing.categoryId,
      basePrice: basePrice ?? existing.basePrice,
      featured: featured ?? existing.featured,
      active: active ?? existing.active,
      turnaroundNote: turnaroundNote ?? existing.turnaroundNote,
      rating: rating ?? existing.rating,
      reviewCount: reviewCount ?? existing.reviewCount,
    },
  })

  // Replace images
  if (images) {
    await db.productImage.deleteMany({ where: { productId: id } })
    for (let i = 0; i < images.length; i++) {
      await db.productImage.create({
        data: { productId: id, url: images[i].url, alt: images[i].alt || name || existing.name, order: i },
      })
    }
  }

  // Replace variant tree (attributes + options + variants)
  if (attributes) {
    // Delete old
    await db.variantAttribute.deleteMany({ where: { productId: id } })
    // Create new
    for (let ai = 0; ai < attributes.length; ai++) {
      const attr = attributes[ai]
      const created = await db.variantAttribute.create({
        data: { productId: id, name: attr.name, order: ai },
      })
      const optMap: Record<string, string> = {}
      for (let oi = 0; oi < attr.options.length; oi++) {
        const opt = await db.variantOption.create({
          data: { attributeId: created.id, value: attr.options[oi], order: oi },
        })
        optMap[attr.options[oi]] = opt.id
      }
      ;(attr as any)._id = created.id
      ;(attr as any)._optMap = optMap
    }
  }

  if (variants) {
    await db.productVariant.deleteMany({ where: { productId: id } })
    for (const v of variants) {
      const variant = await db.productVariant.create({
        data: { productId: id, price: v.price, sku: v.sku, stock: v.stock ?? 0 },
      })
      for (const [attrName, optVal] of Object.entries(v.options || {})) {
        const attr = attributes?.find((a: any) => a.name === attrName)
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
    // Recompute base price
    if (variants.length) {
      const minPrice = Math.min(...variants.map((v: any) => v.price))
      await db.product.update({ where: { id }, data: { basePrice: minPrice } })
    }
  }

  const updated = await fetchProductBySlug(finalSlug)
  return Response.json({ ok: true, product: updated })
}

// Delete product
export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  await db.product.delete({ where: { id } })
  return Response.json({ ok: true })
}

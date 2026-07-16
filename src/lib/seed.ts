// Seed script — run with: bun run src/lib/seed.ts
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { slugify } from '@/lib/format'

async function main() {
  console.log('🌱 Seeding Murlidhar Offset database...')

  // ─── Admin ─────────────────────────────────────────────────────────────────
  const adminEmail = 'admin@murlidharoffset.com'
  const existingAdmin = await db.adminUser.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await db.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: hashPassword('admin123'),
        name: 'Prince Patel',
        role: 'superadmin',
      },
    })
    console.log('  ✓ admin user:', adminEmail, '/ admin123')
  }

  // ─── Site Settings ────────────────────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'Murlidhar Offset',
      tagline: 'We Print Your Dreams on Paper',
      aboutText:
        'Murlidhar Offset is a family-run printing press in the heart of Unjha, Gujarat. For over three decades we have served businesses, families and institutions across North Gujarat with one promise — quality printing, delivered on time, at honest prices.\n\nEquipped with a Konica Minolta AccurioPrint C4065 digital press and a full suite of pre-press, post-press and finishing equipment, we handle everything from a single visiting card to large-volume commercial print runs. Our craft blends traditional Gujarati print sensibility with modern digital precision.',
      phone: '9510737852',
      altPhone: '079160 29127',
      email: 'murlidharoffset84@gmail.com',
      address: 'Shreeji Super Market, 7, Unjha, Gujarat 384170',
      hours: 'Open 24 hours',
      whatsapp: '919510737852',
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      mapEmbedUrl:
        'https://www.google.com/maps?q=Unjha,Gujarat,384170&output=embed',
      codEnabled: true,
      onlineEnabled: true,
      payAtShopEnabled: true,
      emailEnabled: false,
      metaTitle: 'Murlidhar Offset — Quality Printing Press in Unjha, Gujarat',
      metaDescription:
        'Premium printing press in Unjha, Gujarat. Visiting cards, wedding cards (kankotri), letterheads, bill books, flex banners, brochures, packaging & more.',
    },
  })
  console.log('  ✓ site settings')

  // ─── Categories ───────────────────────────────────────────────────────────
  const categories = [
    { name: 'Business Cards', slug: 'business-cards', icon: 'CreditCard', order: 1 },
    { name: 'Letterheads', slug: 'letterheads', icon: 'FileText', order: 2 },
    { name: 'Envelopes', slug: 'envelopes', icon: 'Mail', order: 3 },
    { name: 'Pamphlets & Flyers', slug: 'pamphlets-flyers', icon: 'Newspaper', order: 4 },
    { name: 'A3 Brochures', slug: 'a3-brochures', icon: 'BookOpen', order: 5 },
    { name: 'Files & Folders', slug: 'files-folders', icon: 'Folder', order: 6 },
  ]
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        order: c.order,
        active: true,
        description: `${c.name} printed on premium stock with sharp, vibrant output.`,
      },
    })
  }
  console.log('  ✓ categories (', categories.length, ')')

  // ─── Products ──────────────────────────────────────────────────────────────
  type SeedVariant = { options: Record<string, string>; price: number }
  type SeedProduct = {
    name: string
    slug: string
    category: string
    shortDesc?: string
    description: string
    turnaroundNote?: string
    featured?: boolean
    attributes: { name: string; options: string[] }[]
    variants: SeedVariant[]
  }

  const products: SeedProduct[] = [
    // ─── Business Cards ──────────────────────────────────────────────────────
    {
      name: 'Premium Business Cards',
      slug: 'premium-business-cards',
      category: 'business-cards',
      shortDesc: 'Gold foil, dripoff UV, matt & texture finishes — make every handshake count.',
      description:
        'Our premium line of visiting cards crafted on 350–400 GSM stock with luxurious finishes including gold foil, dripoff UV, matt lamination and texture. Each card is printed on the Konica Minolta AccurioPrint C4065 for razor-sharp text and true-to-life colours.',
      turnaroundNote: 'Delivered in 3–4 working days',
      featured: true,
      attributes: [
        {
          name: 'Card Type',
          options: [
            'Gold Foil 350 GSM — Single Foil FB',
            '400 GSM Roundcut Dripoff UV (Single/FB)',
            'Non Terebal Single or FB (with Coating)',
            'Dripoff NT Single',
            'Dripoff NT Front Back',
            'Non Terebal Single Side',
            'Non Terebal Front Back',
            'Artcard Single Side (250 GSM)',
            'Artcard F&B with Lamination (250 GSM)',
            'Artcard Front Back Without Lamination (300 GSM)',
            'Matt Card (350 GSM)',
            'Matt UV 370 GSM Single UV Front/Back Printing',
            'Matt UV 370 GSM F&B Front/Back UV',
            'Matt Texture (350 GSM)',
            'Artcard Single Side Lamination (250 GSM)',
            '350 GSM FBB Board (Single Side)',
          ],
        },
        { name: 'Quantity', options: ['100 pcs', '250 pcs', '500 pcs', '1000 pcs'] },
      ],
      variants: buildBusinessCardVariants(),
    },
    {
      name: 'High Bulk Commercial Business Cards',
      slug: 'high-bulk-commercial-business-cards',
      category: 'business-cards',
      shortDesc: 'Cost-effective bulk cards for everyday business use.',
      description:
        'High bulk commercial visiting cards — ideal for staff, field teams and bulk distribution. Available in RP-P and RP-CP stock with optional coating.',
      turnaroundNote: 'Delivered in 2–3 working days',
      featured: true,
      attributes: [
        {
          name: 'Card Type',
          options: [
            'RP-P Single Side',
            'RP-P Front & Back',
            'RP-CP Single Side',
            'RP-CP Front & Back',
          ],
        },
        { name: 'Quantity', options: ['500 pcs', '1000 pcs', '2000 pcs', '5000 pcs'] },
      ],
      variants: [
        { options: { 'Card Type': 'RP-P Single Side', Quantity: '500 pcs' }, price: 180 },
        { options: { 'Card Type': 'RP-P Single Side', Quantity: '1000 pcs' }, price: 320 },
        { options: { 'Card Type': 'RP-P Single Side', Quantity: '2000 pcs' }, price: 580 },
        { options: { 'Card Type': 'RP-P Single Side', Quantity: '5000 pcs' }, price: 1300 },
        { options: { 'Card Type': 'RP-P Front & Back', Quantity: '500 pcs' }, price: 260 },
        { options: { 'Card Type': 'RP-P Front & Back', Quantity: '1000 pcs' }, price: 460 },
        { options: { 'Card Type': 'RP-P Front & Back', Quantity: '2000 pcs' }, price: 820 },
        { options: { 'Card Type': 'RP-P Front & Back', Quantity: '5000 pcs' }, price: 1900 },
        { options: { 'Card Type': 'RP-CP Single Side', Quantity: '500 pcs' }, price: 240 },
        { options: { 'Card Type': 'RP-CP Single Side', Quantity: '1000 pcs' }, price: 430 },
        { options: { 'Card Type': 'RP-CP Single Side', Quantity: '2000 pcs' }, price: 780 },
        { options: { 'Card Type': 'RP-CP Single Side', Quantity: '5000 pcs' }, price: 1750 },
        { options: { 'Card Type': 'RP-CP Front & Back', Quantity: '500 pcs' }, price: 320 },
        { options: { 'Card Type': 'RP-CP Front & Back', Quantity: '1000 pcs' }, price: 580 },
        { options: { 'Card Type': 'RP-CP Front & Back', Quantity: '2000 pcs' }, price: 1050 },
        { options: { 'Card Type': 'RP-CP Front & Back', Quantity: '5000 pcs' }, price: 2400 },
      ],
    },
    // ─── Letterheads ─────────────────────────────────────────────────────────
    {
      name: 'Premium Letterheads',
      slug: 'premium-letterheads',
      category: 'letterheads',
      shortDesc: 'Crisp, professional letterheads on premium bond paper.',
      description:
        'Premium letterheads printed on 100 GSM Alabaster paper for a smooth, professional finish that takes ink beautifully. Perfect for official correspondence, quotations and invoices.',
      turnaroundNote: 'Delivered in 2–3 working days',
      featured: true,
      attributes: [
        {
          name: 'Paper Type',
          options: [
            'Premium Super White 100 GSM Alabaster',
            'Cedar Alabaster 100 GSM',
            '100 GSM Excel Bond',
          ],
        },
        { name: 'Quantity', options: ['100 sheets', '250 sheets', '500 sheets', '1000 sheets'] },
      ],
      variants: [
        { options: { 'Paper Type': 'Premium Super White 100 GSM Alabaster', Quantity: '100 sheets' }, price: 450 },
        { options: { 'Paper Type': 'Premium Super White 100 GSM Alabaster', Quantity: '250 sheets' }, price: 950 },
        { options: { 'Paper Type': 'Premium Super White 100 GSM Alabaster', Quantity: '500 sheets' }, price: 1700 },
        { options: { 'Paper Type': 'Premium Super White 100 GSM Alabaster', Quantity: '1000 sheets' }, price: 3100 },
        { options: { 'Paper Type': 'Cedar Alabaster 100 GSM', Quantity: '100 sheets' }, price: 380 },
        { options: { 'Paper Type': 'Cedar Alabaster 100 GSM', Quantity: '250 sheets' }, price: 820 },
        { options: { 'Paper Type': 'Cedar Alabaster 100 GSM', Quantity: '500 sheets' }, price: 1480 },
        { options: { 'Paper Type': 'Cedar Alabaster 100 GSM', Quantity: '1000 sheets' }, price: 2700 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '100 sheets' }, price: 300 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '250 sheets' }, price: 650 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '500 sheets' }, price: 1180 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '1000 sheets' }, price: 2150 },
      ],
    },
    // ─── Envelopes ───────────────────────────────────────────────────────────
    {
      name: 'Vyavhar Covers (Envelopes)',
      slug: 'envelopes-vyavhar-covers',
      category: 'envelopes',
      shortDesc: 'Custom-printed envelopes & vyavhar covers.',
      description:
        'Envelopes and Vyavhar covers printed on 100 GSM premium stock, with optional Spot UV for a premium look. Available in standard and custom sizes.',
      turnaroundNote: 'Delivered in 3–4 working days',
      featured: true,
      attributes: [
        {
          name: 'Paper Type',
          options: [
            '100 GSM Super White Alabaster',
            '100 GSM Cedar',
            'With Spot UV',
            '100 GSM Excel Bond',
          ],
        },
        { name: 'Quantity', options: ['100 pcs', '250 pcs', '500 pcs', '1000 pcs'] },
      ],
      variants: [
        { options: { 'Paper Type': '100 GSM Super White Alabaster', Quantity: '100 pcs' }, price: 480 },
        { options: { 'Paper Type': '100 GSM Super White Alabaster', Quantity: '250 pcs' }, price: 1050 },
        { options: { 'Paper Type': '100 GSM Super White Alabaster', Quantity: '500 pcs' }, price: 1900 },
        { options: { 'Paper Type': '100 GSM Super White Alabaster', Quantity: '1000 pcs' }, price: 3500 },
        { options: { 'Paper Type': '100 GSM Cedar', Quantity: '100 pcs' }, price: 420 },
        { options: { 'Paper Type': '100 GSM Cedar', Quantity: '250 pcs' }, price: 920 },
        { options: { 'Paper Type': '100 GSM Cedar', Quantity: '500 pcs' }, price: 1680 },
        { options: { 'Paper Type': '100 GSM Cedar', Quantity: '1000 pcs' }, price: 3100 },
        { options: { 'Paper Type': 'With Spot UV', Quantity: '100 pcs' }, price: 720 },
        { options: { 'Paper Type': 'With Spot UV', Quantity: '250 pcs' }, price: 1580 },
        { options: { 'Paper Type': 'With Spot UV', Quantity: '500 pcs' }, price: 2850 },
        { options: { 'Paper Type': 'With Spot UV', Quantity: '1000 pcs' }, price: 5200 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '100 pcs' }, price: 350 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '250 pcs' }, price: 780 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '500 pcs' }, price: 1420 },
        { options: { 'Paper Type': '100 GSM Excel Bond', Quantity: '1000 pcs' }, price: 2650 },
      ],
    },
    // ─── Pamphlets & Flyers ──────────────────────────────────────────────────
    {
      name: 'Pamphlets & Flyers',
      slug: 'pamphlets-flyers',
      category: 'pamphlets-flyers',
      shortDesc: 'High-impact flyers for promotions, events & festivals.',
      description:
        'Vibrant flyers and pamphlets printed on premium paper stocks from 90 to 170 GSM. Available in A5 and A4 sizes — perfect for promotional campaigns, events and festival announcements.',
      turnaroundNote: 'Delivered in 2–3 working days',
      featured: true,
      attributes: [
        {
          name: 'Paper Type',
          options: [
            '90 GSM A5 size',
            '90 GSM A4 size',
            '100 GSM A5 size',
            '100 GSM A4 size',
            '130 GSM A4 size',
            '170 GSM A4 size',
          ],
        },
        { name: 'Quantity', options: ['500 pcs', '1000 pcs', '2000 pcs', '5000 pcs'] },
      ],
      variants: [
        { options: { 'Paper Type': '90 GSM A5 size', Quantity: '500 pcs' }, price: 550 },
        { options: { 'Paper Type': '90 GSM A5 size', Quantity: '1000 pcs' }, price: 950 },
        { options: { 'Paper Type': '90 GSM A5 size', Quantity: '2000 pcs' }, price: 1700 },
        { options: { 'Paper Type': '90 GSM A5 size', Quantity: '5000 pcs' }, price: 3900 },
        { options: { 'Paper Type': '90 GSM A4 size', Quantity: '500 pcs' }, price: 950 },
        { options: { 'Paper Type': '90 GSM A4 size', Quantity: '1000 pcs' }, price: 1700 },
        { options: { 'Paper Type': '90 GSM A4 size', Quantity: '2000 pcs' }, price: 3100 },
        { options: { 'Paper Type': '90 GSM A4 size', Quantity: '5000 pcs' }, price: 7200 },
        { options: { 'Paper Type': '100 GSM A5 size', Quantity: '500 pcs' }, price: 620 },
        { options: { 'Paper Type': '100 GSM A5 size', Quantity: '1000 pcs' }, price: 1100 },
        { options: { 'Paper Type': '100 GSM A5 size', Quantity: '2000 pcs' }, price: 1950 },
        { options: { 'Paper Type': '100 GSM A5 size', Quantity: '5000 pcs' }, price: 4400 },
        { options: { 'Paper Type': '100 GSM A4 size', Quantity: '500 pcs' }, price: 1080 },
        { options: { 'Paper Type': '100 GSM A4 size', Quantity: '1000 pcs' }, price: 1950 },
        { options: { 'Paper Type': '100 GSM A4 size', Quantity: '2000 pcs' }, price: 3500 },
        { options: { 'Paper Type': '100 GSM A4 size', Quantity: '5000 pcs' }, price: 8100 },
        { options: { 'Paper Type': '130 GSM A4 size', Quantity: '500 pcs' }, price: 1300 },
        { options: { 'Paper Type': '130 GSM A4 size', Quantity: '1000 pcs' }, price: 2350 },
        { options: { 'Paper Type': '130 GSM A4 size', Quantity: '2000 pcs' }, price: 4200 },
        { options: { 'Paper Type': '130 GSM A4 size', Quantity: '5000 pcs' }, price: 9800 },
        { options: { 'Paper Type': '170 GSM A4 size', Quantity: '500 pcs' }, price: 1650 },
        { options: { 'Paper Type': '170 GSM A4 size', Quantity: '1000 pcs' }, price: 3000 },
        { options: { 'Paper Type': '170 GSM A4 size', Quantity: '2000 pcs' }, price: 5400 },
        { options: { 'Paper Type': '170 GSM A4 size', Quantity: '5000 pcs' }, price: 12500 },
      ],
    },
    // ─── A3 Brochures ────────────────────────────────────────────────────────
    {
      name: 'A3 Brochures',
      slug: 'a3-brochures',
      category: 'a3-brochures',
      shortDesc: 'Premium A3 bifold brochures with optional Spot UV.',
      description:
        'A3 bifold brochures printed on premium stock with crisp folds and vibrant colour reproduction. Optional Spot UV for a striking premium finish on key design elements.',
      turnaroundNote: 'Delivered in 3–5 working days',
      featured: true,
      attributes: [
        {
          name: 'Brochure Type',
          options: ['Bifold', 'Bifold with Spot UV'],
        },
        { name: 'Quantity', options: ['100 pcs', '250 pcs', '500 pcs', '1000 pcs'] },
      ],
      variants: [
        { options: { 'Brochure Type': 'Bifold', Quantity: '100 pcs' }, price: 1800 },
        { options: { 'Brochure Type': 'Bifold', Quantity: '250 pcs' }, price: 3900 },
        { options: { 'Brochure Type': 'Bifold', Quantity: '500 pcs' }, price: 7200 },
        { options: { 'Brochure Type': 'Bifold', Quantity: '1000 pcs' }, price: 13500 },
        { options: { 'Brochure Type': 'Bifold with Spot UV', Quantity: '100 pcs' }, price: 2600 },
        { options: { 'Brochure Type': 'Bifold with Spot UV', Quantity: '250 pcs' }, price: 5600 },
        { options: { 'Brochure Type': 'Bifold with Spot UV', Quantity: '500 pcs' }, price: 10200 },
        { options: { 'Brochure Type': 'Bifold with Spot UV', Quantity: '1000 pcs' }, price: 19000 },
      ],
    },
    // ─── Files & Folders ─────────────────────────────────────────────────────
    {
      name: 'Files And Folders',
      slug: 'files-and-folders',
      category: 'files-folders',
      shortDesc: 'Sturdy presentation files & folders on board stock.',
      description:
        'Premium presentation files and folders printed on heavy board stock — 320 GSM SBS Board or 400 GSM Whiteback Duplex Board. Perfect for corporate presentations, certificates and document kits.',
      turnaroundNote: 'Delivered in 4–5 working days',
      featured: true,
      attributes: [
        {
          name: 'Board Type',
          options: ['320 GSM SBS Board', '400 GSM Whiteback Duplex Board'],
        },
        { name: 'Quantity', options: ['50 pcs', '100 pcs', '250 pcs', '500 pcs'] },
      ],
      variants: [
        { options: { 'Board Type': '320 GSM SBS Board', Quantity: '50 pcs' }, price: 1450 },
        { options: { 'Board Type': '320 GSM SBS Board', Quantity: '100 pcs' }, price: 2700 },
        { options: { 'Board Type': '320 GSM SBS Board', Quantity: '250 pcs' }, price: 6100 },
        { options: { 'Board Type': '320 GSM SBS Board', Quantity: '500 pcs' }, price: 11500 },
        { options: { 'Board Type': '400 GSM Whiteback Duplex Board', Quantity: '50 pcs' }, price: 1850 },
        { options: { 'Board Type': '400 GSM Whiteback Duplex Board', Quantity: '100 pcs' }, price: 3500 },
        { options: { 'Board Type': '400 GSM Whiteback Duplex Board', Quantity: '250 pcs' }, price: 7900 },
        { options: { 'Board Type': '400 GSM Whiteback Duplex Board', Quantity: '500 pcs' }, price: 14800 },
      ],
    },
  ]

  for (const p of products) {
    const cat = await db.category.findUnique({ where: { slug: p.category } })
    if (!cat) continue
    await db.product.deleteMany({ where: { slug: p.slug } }).catch(() => {})
    const product = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        shortDesc: p.shortDesc,
        description: p.description,
        categoryId: cat.id,
        featured: p.featured ?? false,
        active: true,
        rating: 5,
        reviewCount: Math.floor(Math.random() * 40) + 8,
        turnaroundNote: p.turnaroundNote,
        basePrice: Math.min(...p.variants.map((v) => v.price)),
        images: {
          create: [
            {
              url: `/products/${p.slug}.jpg`,
              alt: p.name,
              order: 0,
            },
          ],
        },
      },
    })

    // Build variant attributes & options
    const attrMap: Record<string, { id: string; options: Record<string, string> }> = {}
    for (const a of p.attributes) {
      const attr = await db.variantAttribute.create({
        data: { productId: product.id, name: a.name, order: p.attributes.indexOf(a) },
      })
      const optMap: Record<string, string> = {}
      for (const [i, val] of a.options.entries()) {
        const opt = await db.variantOption.create({
          data: { attributeId: attr.id, value: val, order: i },
        })
        optMap[val] = opt.id
      }
      attrMap[a.name] = { id: attr.id, options: optMap }
    }

    // Build variants
    for (const v of p.variants) {
      const variant = await db.productVariant.create({
        data: { productId: product.id, price: v.price, stock: 9999 },
      })
      for (const [attrName, optVal] of Object.entries(v.options)) {
        const optId = attrMap[attrName]?.options[optVal]
        if (optId) {
          await db.productVariantOption.create({
            data: { variantId: variant.id, optionId: optId },
          })
        }
      }
    }
  }
  console.log('  ✓ products (', products.length, ')')

  // ─── Banners ───────────────────────────────────────────────────────────────
  await db.banner.deleteMany({})
  const banners = [
    {
      title: 'We Print Your Dreams on Paper',
      subtitle: 'Premium printing press in Unjha, Gujarat — visiting cards, wedding cards, brochures & more.',
      imageUrl: '/banners/hero-1.jpg',
      link: '/shop',
      order: 0,
    },
    {
      title: 'Wedding Season Kankotri',
      subtitle: 'Exquisite wedding card printing with traditional Gujarati craftsmanship.',
      imageUrl: '/banners/hero-2.jpg',
      link: '/shop',
      order: 1,
    },
    {
      title: 'Business Cards That Impress',
      subtitle: 'Gold foil, dripoff UV, matt & texture finishes — starting from ₹180.',
      imageUrl: '/banners/hero-3.jpg',
      link: '/product/premium-business-cards',
      order: 2,
    },
  ]
  for (const b of banners) {
    await db.banner.create({ data: { ...b, position: 'hero', active: true } })
  }
  console.log('  ✓ banners (', banners.length, ')')

  // ─── Testimonials ──────────────────────────────────────────────────────────
  await db.testimonial.deleteMany({})
  const testimonials = [
    { name: 'Rajesh Patel', location: 'Unjha', rating: 5, text: 'Best printing press in Unjha. Visiting cards came out sharp and on time. Prince bhai is very professional.' },
    { name: 'Meera Desai', location: 'Mehsana', rating: 5, text: 'Got my wedding kankotri printed here. Beautiful quality and the team understood exactly what we wanted. Highly recommend!' },
    { name: 'Kiran Shah', location: 'Palanpur', rating: 5, text: 'Been ordering letterheads and bill books for 3 years. Consistent quality and always delivered on time.' },
    { name: 'Ankit Joshi', location: 'Visnagar', rating: 5, text: 'Brochures for my business came out premium quality. Spot UV finish was perfect. Will order again.' },
    { name: 'Priya Thakkar', location: 'Unjha', rating: 5, text: 'Family-run business with great attention to detail. They treat every order like it matters — because it does.' },
  ]
  for (const t of testimonials) {
    await db.testimonial.create({ data: t })
  }
  console.log('  ✓ testimonials (', testimonials.length, ')')

  // ─── Blog ──────────────────────────────────────────────────────────────────
  await db.blogPost.deleteMany({})
  const posts = [
    {
      title: 'How to Prepare a Print-Ready File for Your Visiting Card',
      slug: 'how-to-prepare-print-ready-file-visiting-card',
      excerpt: 'A step-by-step guide on preparing your visiting card artwork in CorelDRAW or Photoshop for crisp, professional printing.',
      content: '<p>Preparing your artwork correctly is the single biggest factor in getting a crisp, professional visiting card. In this guide we walk through bleed, trim, safe area, colour mode (CMYK), resolution (300 DPI) and exporting a print-ready PDF.</p><h2>1. Set the correct canvas size</h2><p>Standard Indian visiting card size is 90 × 54 mm. Add 3 mm bleed on each side → 96 × 60 mm canvas. Keep all important text within a 5 mm safe margin from the trim edge.</p><h2>2. Work in CMYK</h2><p>Always design in CMYK colour mode. RGB colours look different on paper and may print dull.</p><h2>3. Export as PDF with 300 DPI</h2><p>Export your final artwork as a high-resolution PDF (300 DPI) with fonts embedded. Avoid JPG for text-heavy designs.</p>',
      tags: 'printing tips,visiting cards,design',
      published: true,
      author: 'Prince Patel',
    },
    {
      title: 'Wedding Kankotri Trends in Gujarat for 2025',
      slug: 'wedding-kankotri-trends-gujarat-2025',
      excerpt: 'From minimalist Ganesha motifs to gold-foil borders — explore the latest wedding card trends sweeping Gujarat this season.',
      content: '<p>Gujarati wedding cards have evolved beautifully over the last few years. Here are the top trends we are seeing in 2025:</p><h2>Gold foil borders</h2><p>Thin gold foil lines framing the card with traditional Ganesha or Kalash motifs remain the most popular choice.</p><h2>Minimalist pastel cards</h2><p>Younger couples are opting for pastel backgrounds with subtle debossed patterns — elegant and modern.</p><h2>Custom monograms</h2><p>Couple initials designed as a custom monogram on the cover flap add a personal touch.</p>',
      tags: 'wedding cards,kankotri,gujarat',
      published: true,
      author: 'Rasik Patel',
    },
    {
      title: 'Why We Chose the Konica Minolta AccurioPrint C4065',
      slug: 'why-konica-minolta-accurioprint-c4065',
      excerpt: 'A look at the digital press that powers Murlidhar Offset — and why it means sharper, faster, more affordable prints for you.',
      content: '<p>At Murlidhar Offset we recently upgraded to the Konica Minolta AccurioPrint C4065 digital press. Here is why this machine is a game-changer for our customers:</p><h2>1. Exceptional colour accuracy</h2><p>The C4065 delivers consistent, vibrant colours across long print runs — your brand colours stay true from card #1 to card #5000.</p><h2>2. Heavy stock support</h2><p>Handles up to 400 GSM stock — perfect for premium visiting cards, postcards and covers.</p><h2>3. Faster turnaround</h2><p>High-speed printing means most small orders ship the same day.</p>',
      tags: 'technology,press,quality',
      published: true,
      author: 'Prince Patel',
    },
  ]
  for (const post of posts) {
    await db.blogPost.create({
      data: {
        ...post,
        featuredImage: `/blog/${post.slug}.jpg`,
      },
    })
  }
  console.log('  ✓ blog posts (', posts.length, ')')

  console.log('✅ Seed complete.')
}

function buildBusinessCardVariants(): SeedVariant[] {
  const cardTypes = [
    'Gold Foil 350 GSM — Single Foil FB',
    '400 GSM Roundcut Dripoff UV (Single/FB)',
    'Non Terebal Single or FB (with Coating)',
    'Dripoff NT Single',
    'Dripoff NT Front Back',
    'Non Terebal Single Side',
    'Non Terebal Front Back',
    'Artcard Single Side (250 GSM)',
    'Artcard F&B with Lamination (250 GSM)',
    'Artcard Front Back Without Lamination (300 GSM)',
    'Matt Card (350 GSM)',
    'Matt UV 370 GSM Single UV Front/Back Printing',
    'Matt UV 370 GSM F&B Front/Back UV',
    'Matt Texture (350 GSM)',
    'Artcard Single Side Lamination (250 GSM)',
    '350 GSM FBB Board (Single Side)',
  ]
  const quantities = ['100 pcs', '250 pcs', '500 pcs', '1000 pcs']
  // Base price per card type for 100 pcs
  const basePrices: Record<string, number> = {
    'Gold Foil 350 GSM — Single Foil FB': 450,
    '400 GSM Roundcut Dripoff UV (Single/FB)': 380,
    'Non Terebal Single or FB (with Coating)': 280,
    'Dripoff NT Single': 300,
    'Dripoff NT Front Back': 420,
    'Non Terebal Single Side': 220,
    'Non Terebal Front Back': 340,
    'Artcard Single Side (250 GSM)': 180,
    'Artcard F&B with Lamination (250 GSM)': 280,
    'Artcard Front Back Without Lamination (300 GSM)': 240,
    'Matt Card (350 GSM)': 320,
    'Matt UV 370 GSM Single UV Front/Back Printing': 360,
    'Matt UV 370 GSM F&B Front/Back UV': 480,
    'Matt Texture (350 GSM)': 380,
    'Artcard Single Side Lamination (250 GSM)': 220,
    '350 GSM FBB Board (Single Side)': 200,
  }
  const qtyMultiplier: Record<string, number> = {
    '100 pcs': 1,
    '250 pcs': 2.1,
    '500 pcs': 3.6,
    '1000 pcs': 6.2,
  }
  const variants: SeedVariant[] = []
  for (const ct of cardTypes) {
    for (const q of quantities) {
      const price = Math.round((basePrices[ct] ?? 250) * qtyMultiplier[q])
      variants.push({ options: { 'Card Type': ct, Quantity: q }, price })
    }
  }
  return variants
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

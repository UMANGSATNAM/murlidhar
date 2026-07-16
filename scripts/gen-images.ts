// Generate all brand images for Murlidhar Offset
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), 'public')

async function gen(prompt: string, size: string, outPath: string) {
  if (fs.existsSync(outPath)) {
    console.log('  skip (exists):', outPath)
    return true
  }
  try {
    const zai = await ZAI.create()
    const res = await zai.images.generations.create({ prompt, size })
    const b64 = res.data[0].base64
    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'))
    console.log('  ✓', outPath)
    return true
  } catch (e: any) {
    console.error('  ✗', outPath, e?.message ?? e)
    return false
  }
}

async function main() {
  await fs.promises.mkdir(path.join(ROOT, 'banners'), { recursive: true })
  await fs.promises.mkdir(path.join(ROOT, 'products'), { recursive: true })
  await fs.promises.mkdir(path.join(ROOT, 'blog'), { recursive: true })

  console.log('Generating logo...')
  await gen(
    'A circular mandala emblem logo, white line-art mandala pattern on deep navy blue background, a gold mustard colored flute (bansuri) icon in the center, elegant Indian traditional design, premium boutique brand logo, minimal, high quality, vector style',
    '1024x1024',
    path.join(ROOT, 'logo.png')
  )

  console.log('Generating hero banners...')
  await gen(
    'Premium printing press hero banner, elegant arrangement of printed samples including visiting cards, letterheads and wedding cards on a dark deep navy blue textured background with subtle gold mandala patterns, cinematic luxury lighting, gold and mustard accents, boutique print studio aesthetic, high quality product photography, no text',
    '1440x720',
    path.join(ROOT, 'banners', 'hero-1.jpg')
  )
  await gen(
    'Gujarati wedding card kankotri close-up, traditional Indian wedding invitation with gold foil Ganesha motif, deep maroon and gold color palette, elegant premium design, mandala borders, soft warm lighting, luxury paper craft, high quality',
    '1440x720',
    path.join(ROOT, 'banners', 'hero-2.jpg')
  )
  await gen(
    'Stack of premium business cards with gold foil edges fanned out on a deep navy blue surface, top-down product photography, gold and navy color scheme, luxury stationery, cinematic lighting, high quality',
    '1440x720',
    path.join(ROOT, 'banners', 'hero-3.jpg')
  )

  console.log('Generating product images...')
  const products = [
    ['premium-business-cards', 'Premium business cards fanned out with gold foil edge, navy and gold color scheme, clean cream background, professional product photography, studio lighting, high quality'],
    ['high-bulk-commercial-business-cards', 'Stack of simple commercial business cards on cream background, clean minimal product photography, professional, high quality'],
    ['premium-letterheads', 'Crisp white letterhead stack with subtle elegant logo on top sheet, cream background, professional stationery photography, high quality'],
    ['envelopes-vyavhar-covers', 'Stack of premium printed envelopes and vyavhar covers on cream background, professional product photography, gold accents, high quality'],
    ['pamphlets-flyers', 'Colorful promotional flyers and pamphlets fanned out on cream background, vibrant print samples, professional photography, high quality'],
    ['a3-brochures', 'Folded A3 bifold brochures spread open showing premium design, cream background, professional product photography, gold accents, high quality'],
    ['files-and-folders', 'Premium presentation file folders with branding on cream background, professional stationery photography, navy and gold, high quality'],
  ]
  for (const [slug, prompt] of products) {
    await gen(prompt, '1024x1024', path.join(ROOT, 'products', `${slug}.jpg`))
  }

  console.log('Generating blog images...')
  const blog = [
    ['how-to-prepare-print-ready-file-visiting-card', 'Design workspace with business card artwork on computer screen, color swatches and printed samples, professional graphic design setup, warm lighting, high quality'],
    ['wedding-kankotri-trends-gujarat-2025', 'Elegant Gujarati wedding card flatlay with marigold flowers, gold accents, traditional Indian wedding stationery, premium, warm lighting, high quality'],
    ['why-konica-minolta-accurioprint-c4065', 'Modern digital printing press machine in a clean professional print shop, white and navy color scheme, industrial photography, high quality'],
  ]
  for (const [slug, prompt] of blog) {
    await gen(prompt, '1344x768', path.join(ROOT, 'blog', `${slug}.jpg`))
  }

  console.log('✅ All images generated.')
}

main().catch((e) => { console.error(e); process.exit(1) })

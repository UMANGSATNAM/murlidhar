// Image generation script for Murlidhar Offset
// Uses z-ai-web-dev-sdk directly for batch generation with retries.
// Note: dimensions must be multiples of 32, between 512-2880, max pixels ≤ 2^22.

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const WIDE = '1344x768';   // hero & blog (multiples of 32, both within 512-2880, ≤ 2^22 px)
const SQUARE = '1024x1024'; // product & logo

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const IMAGES = [
  // ---- Hero banners (1344x768 wide) ----
  {
    path: '/home/z/my-project/public/banners/hero-1.jpg',
    size: WIDE,
    prompt: 'Premium printing press hero shot, elegant arrangement of printed samples including visiting cards, letterheads and traditional Gujarati kankotri wedding cards arranged on a dark navy textured background, subtle gold mandala patterns, deep navy and gold color palette, cinematic luxury lighting, soft golden glow, photorealistic, high-end product photography, elegant, sophisticated, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/banners/hero-2.jpg',
    size: WIDE,
    prompt: 'Close-up of elegant Gujarati wedding kankotri card with gold foil Ganesha motif, traditional Indian wedding invitation design, deep maroon and gold accents, intricate mandala border, gold foil stamping, luxurious textured paper, premium product photography, soft warm lighting, photorealistic, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/banners/hero-3.jpg',
    size: WIDE,
    prompt: 'Top-down product shot of stack of premium business cards fanned out on dark navy surface, gold foil edge accents, deep navy and gold color scheme, luxury stationery photography, soft directional lighting, photorealistic, elegant, no text, no watermark',
  },
  // ---- Product images (1024x1024 square) ----
  {
    path: '/home/z/my-project/public/products/premium-business-cards.jpg',
    size: SQUARE,
    prompt: 'Premium business cards fanned out on clean cream background, gold foil edge accents, deep navy and gold color scheme, elegant luxury stationery, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/high-bulk-commercial-business-cards.jpg',
    size: SQUARE,
    prompt: 'Neat stack of simple commercial business cards on clean white background, thick bulk paper stock, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/premium-letterheads.jpg',
    size: SQUARE,
    prompt: 'Crisp white premium letterhead paper stack on clean cream background, subtle elegant logo on top sheet, professional stationery product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/envelopes-vyavhar-covers.jpg',
    size: SQUARE,
    prompt: 'Stack of premium printed envelopes and traditional Gujarati vyavhar covers on clean cream background, elegant navy and gold branding, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/pamphlets-flyers.jpg',
    size: SQUARE,
    prompt: 'Colorful promotional flyers and pamphlets fanned out on clean white background, vibrant print design samples, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/a3-brochures.jpg',
    size: SQUARE,
    prompt: 'Folded A3 bifold brochures spread open on clean cream background, premium glossy print, elegant layout, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/products/files-and-folders.jpg',
    size: SQUARE,
    prompt: 'Premium presentation file folders with elegant branding on clean cream background, navy and gold accents, professional product photography, soft studio lighting, photorealistic, centered composition, no text, no watermark',
  },
  // ---- Blog images (1344x768 wide) ----
  {
    path: '/home/z/my-project/public/blog/how-to-prepare-print-ready-file-visiting-card.jpg',
    size: WIDE,
    prompt: 'Design workspace with business card artwork on computer screen, color swatches and printed samples on desk, creative studio, navy and gold accents, professional photography, soft warm lighting, photorealistic, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/blog/wedding-kankotri-trends-gujarat-2025.jpg',
    size: WIDE,
    prompt: 'Elegant Gujarati wedding kankotri card flatlay with marigold flowers and gold accents on warm cream surface, traditional Indian wedding invitation design, premium photography, soft natural lighting, photorealistic, no text, no watermark',
  },
  {
    path: '/home/z/my-project/public/blog/why-konica-minolta-accurioprint-c4065.jpg',
    size: WIDE,
    prompt: 'Modern digital printing press machine in clean professional print shop, Konica Minolta AccurioPress style industrial printer, bright modern interior, navy and gold brand accents, professional photography, photorealistic, no text, no watermark',
  },
  // ---- Logo (1024x1024 square) ----
  {
    path: '/home/z/my-project/public/logo.png',
    size: SQUARE,
    prompt: 'Circular mandala emblem logo with a bansuri flute icon in the center, white line-art on deep navy background with gold accents, Krishna Murlidhar theme, elegant premium branding, centered symmetrical composition, flat vector logo style, no text, no watermark',
  },
];

async function generateOne(zai, item, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt: item.prompt,
        size: item.size,
      });
      if (!response?.data?.[0]?.base64) {
        throw new Error('No base64 in response');
      }
      const buf = Buffer.from(response.data[0].base64, 'base64');
      fs.mkdirSync(path.dirname(item.path), { recursive: true });
      fs.writeFileSync(item.path, buf);
      return { ok: true, attempts: attempt, size: buf.length };
    } catch (err) {
      console.error(`  [attempt ${attempt}/${maxAttempts}] failed: ${err.message}`);
      if (attempt < maxAttempts) {
        const backoff = 3000 * attempt;
        await sleep(backoff);
      } else {
        return { ok: false, attempts: attempt, error: err.message };
      }
    }
  }
  return { ok: false, attempts: maxAttempts, error: 'unknown' };
}

async function main() {
  console.log(`Initializing Z-AI SDK...`);
  const zai = await ZAI.create();
  console.log(`Generating ${IMAGES.length} images sequentially...\n`);

  const results = [];
  for (let i = 0; i < IMAGES.length; i++) {
    const item = IMAGES[i];
    console.log(`[${i + 1}/${IMAGES.length}] Generating ${path.basename(item.path)} (${item.size})`);
    const r = await generateOne(zai, item);
    if (r.ok) {
      console.log(`  ✓ saved ${item.path} (${r.size} bytes, ${r.attempts} attempt(s))`);
    } else {
      console.error(`  ✗ FAILED ${item.path}: ${r.error}`);
    }
    results.push({ path: item.path, ...r });
    // small delay between calls to avoid 429
    if (i < IMAGES.length - 1) await sleep(1500);
  }

  console.log('\n=== SUMMARY ===');
  const succeeded = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  console.log(`Success: ${succeeded.length}/${IMAGES.length}`);
  if (failed.length) {
    console.log('Failed files:');
    failed.forEach((f) => console.log(`  - ${f.path} :: ${f.error}`));
  }
  fs.writeFileSync('/tmp/image-gen-results.json', JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});

import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params
    const safeFilename = path.basename(filename)

    // Check multiple candidate locations where uploads might be written
    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', safeFilename),
      path.join(process.cwd(), 'uploads', safeFilename),
      path.join('/tmp', safeFilename),
    ]

    let foundPath: string | null = null
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        foundPath = p
        break
      }
    }

    if (!foundPath) {
      return new Response('File not found', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(foundPath)
    const ext = path.extname(safeFilename).toLowerCase()

    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.cdr': 'application/octet-stream',
      '.ps': 'application/postscript',
      '.eps': 'application/postscript',
      '.ai': 'application/postscript',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext.replace('.', ''))
          ? `inline; filename="${safeFilename}"`
          : `attachment; filename="${safeFilename}"`,
      },
    })
  } catch (err: any) {
    console.error('[uploads:route_error]', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}

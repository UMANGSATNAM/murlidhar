import { NextRequest } from 'next/server'
import { saveFile, allowedDesignExtensions, MAX_DESIGN_FILE_BYTES } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    if (!files.length) {
      return Response.json({ error: 'No files provided' }, { status: 400 })
    }

    const allowed = allowedDesignExtensions()
    const results: { name: string; url: string; size: number; type: string }[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
      if (!allowed.includes(ext)) {
        return Response.json(
          { error: `File type ${ext} not allowed. Allowed: ${allowed.join(', ')}` },
          { status: 400 }
        )
      }
      if (file.size > MAX_DESIGN_FILE_BYTES) {
        return Response.json(
          { error: `File ${file.name} exceeds 50MB limit` },
          { status: 400 }
        )
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await saveFile(buffer, ext, 'design')
      results.push({ name: file.name, url, size: file.size, type: file.type })
    }

    return Response.json({ files: results })
  } catch (err: any) {
    console.error('[upload]', err)
    return Response.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}

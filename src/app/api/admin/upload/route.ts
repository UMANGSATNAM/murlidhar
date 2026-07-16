// Admin image upload (product images, banner images, blog featured images)
import { NextRequest } from 'next/server'
import { saveFile, allowedImageExtensions, MAX_IMAGE_FILE_BYTES } from '@/lib/storage'
import { requireAdmin, unauthorized } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request)
  if (!admin) return unauthorized()

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    if (!files.length) return Response.json({ error: 'No files' }, { status: 400 })

    const allowed = allowedImageExtensions()
    const results: { name: string; url: string; size: number }[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
      if (!allowed.includes(ext)) {
        return Response.json({ error: `Type ${ext} not allowed. Allowed: ${allowed.join(', ')}` }, { status: 400 })
      }
      if (file.size > MAX_IMAGE_FILE_BYTES) {
        return Response.json({ error: `${file.name} exceeds 5MB` }, { status: 400 })
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await saveFile(buffer, ext, 'img')
      results.push({ name: file.name, url, size: file.size })
    }
    return Response.json({ files: results })
  } catch (err: any) {
    return Response.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}

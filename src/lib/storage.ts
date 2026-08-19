// File storage helper — saves uploads under /public/uploads and returns the public URL path.
// In a real deployment this would be swapped for S3/GCS, but the public URL contract stays the same.
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_ROOTS = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'uploads'),
]

export async function saveFile(buffer: Buffer, ext: string, prefix = 'file'): Promise<string> {
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
  
  for (const root of UPLOAD_ROOTS) {
    try {
      await fs.mkdir(root, { recursive: true })
      const fullPath = path.join(root, name)
      await fs.writeFile(fullPath, buffer)
    } catch (e) {
      console.warn('[storage:write_warning]', root, e)
    }
  }

  return `/uploads/${name}`
}

export async function deleteFile(urlPath: string) {
  if (!urlPath?.startsWith('/uploads/')) return
  const filename = path.basename(urlPath)
  for (const root of UPLOAD_ROOTS) {
    try {
      await fs.unlink(path.join(root, filename))
    } catch {
      /* ignore */
    }
  }
}

export function allowedDesignExtensions() {
  return ['.cdr', '.jpg', '.jpeg', '.png', '.ps', '.pdf']
}

export function allowedImageExtensions() {
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
}

export const MAX_DESIGN_FILE_BYTES = 50 * 1024 * 1024 // 50MB
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024 // 5MB

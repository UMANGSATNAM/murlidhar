// File storage helper — saves uploads under /public/uploads and returns the public URL path.
// In a real deployment this would be swapped for S3/GCS, but the public URL contract stays the same.
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')

export async function saveFile(buffer: Buffer, ext: string, prefix = 'file'): Promise<string> {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true })
  const name = `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
  const fullPath = path.join(UPLOAD_ROOT, name)
  await fs.writeFile(fullPath, buffer)
  return `/uploads/${name}`
}

export async function deleteFile(urlPath: string) {
  if (!urlPath?.startsWith('/uploads/')) return
  const fullPath = path.join(UPLOAD_ROOT, path.basename(urlPath))
  try {
    await fs.unlink(fullPath)
  } catch {
    /* ignore */
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

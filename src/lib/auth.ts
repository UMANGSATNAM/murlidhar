// Auth helpers for admin — signed HTTP-only cookie session.
import { db } from '@/lib/db'
import crypto from 'crypto'

// Simple session token = base64(JSON{id,email,role}).signature
// signature = HMAC-SHA256 using SESSION_SECRET
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'murlidhar-offset-dev-secret-change-me'
const COOKIE_NAME = 'mo_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function hashPassword(password: string): string {
  // PBKDF2 — works without external deps
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const verify = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verify, 'hex'))
}

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url')
  return `${data}.${sig}`
}

function verify(token: string): { id: string; email: string; role: string } | null {
  try {
    const [data, sig] = token.split('.')
    if (!data || !sig) return null
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url')
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null
    }
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export interface CookieOptions {
  name: string
  value: string
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
  maxAge: number
}

export function createSessionCookie(user: { id: string; email: string; role: string }): CookieOptions {
  const token = sign(user)
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  }
}

export function clearSessionCookie(): CookieOptions {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  }
}

// Serialize a CookieOptions object into a Set-Cookie header value string.
export function serializeCookie(c: CookieOptions): string {
  const parts: string[] = [`${c.name}=${encodeURIComponent(c.value)}`]
  if (c.httpOnly) parts.push('HttpOnly')
  if (c.secure) parts.push('Secure')
  parts.push(`SameSite=${c.sameSite}`)
  parts.push(`Path=${c.path}`)
  if (c.maxAge !== undefined) parts.push(`Max-Age=${c.maxAge}`)
  return parts.join('; ')
}

export async function getAdminFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const token = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1]
  if (!token) return null
  const payload = verify(token)
  if (!payload) return null
  const admin = await db.adminUser.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, role: true },
  })
  return admin
}

export async function ensureSeedAdmin() {
  const count = await db.adminUser.count()
  if (count === 0) {
    await db.adminUser.create({
      data: {
        email: 'admin@murlidharoffset.com',
        passwordHash: hashPassword('admin123'),
        name: 'Prince Patel',
        role: 'superadmin',
      },
    })
    console.log('[seed] admin user created: admin@murlidharoffset.com / admin123')
  }
}

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyPassword, createSessionCookie, serializeCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()
  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 })
  }
  const admin = await db.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const cookie = createSessionCookie({ id: admin.id, email: admin.email, role: admin.role })
  const cookieStore = await cookies()
  cookieStore.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  })
  const res = Response.json({ ok: true, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } })
  res.headers.set('Set-Cookie', serializeCookie(cookie))
  return res
}

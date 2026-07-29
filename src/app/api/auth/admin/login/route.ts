import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSessionCookie, serializeCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password } = body
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }
    const admin = await db.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const cookie = createSessionCookie({ id: admin.id, email: admin.email, role: admin.role })
    const res = Response.json({ ok: true, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } })
    res.headers.set('Set-Cookie', serializeCookie(cookie))
    return res
  } catch (err: any) {
    console.error('Login route error:', err)
    return Response.json({ error: err.message || 'Server error during login' }, { status: 500 })
  }
}

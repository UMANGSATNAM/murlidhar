import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest, verifyPassword, hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized — please sign in as admin' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { currentPassword, newPassword, confirmPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'New password must be at least 4 characters long' }, { status: 400 })
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirm password do not match' }, { status: 400 })
    }

    // Retrieve user with passwordHash
    const user = await db.adminUser.findUnique({
      where: { id: admin.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 })
    }

    const isValid = verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Update password
    const newHash = hashPassword(newPassword)
    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully! Please keep it secure.',
    })
  } catch (err: any) {
    console.error('[admin change password error]', err)
    return NextResponse.json({ error: err.message || 'Failed to update password' }, { status: 500 })
  }
}

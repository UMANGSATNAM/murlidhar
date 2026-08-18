import { seedDatabase } from '@/lib/seed'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await seedDatabase()
    return Response.json({
      ok: true,
      message: 'Database seeded successfully',
      admin: {
        email: 'admin@murlidharoffset.com',
        password: '1234',
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return Response.json({ error: error.message || 'Failed to seed database' }, { status: 500 })
  }
}

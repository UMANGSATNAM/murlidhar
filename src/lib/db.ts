import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
  // On Vercel / serverless environments, the bundle filesystem (/var/task) is read-only.
  // We copy custom.db to /tmp/custom.db on cold start so write operations (orders, updates) succeed.
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

  if (isVercel) {
    const tmpDbPath = '/tmp/custom.db'
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.resolve(process.cwd(), 'prisma/db/custom.db'),
        path.resolve(process.cwd(), 'db/custom.db'),
      ]
      const srcPath = candidates.find((p) => fs.existsSync(p))
      if (srcPath) {
        try {
          fs.copyFileSync(srcPath, tmpDbPath)
          console.log(`[db] Copied SQLite database to writable location: ${tmpDbPath}`)
        } catch (e) {
          console.error('[db] Error copying database to /tmp:', e)
        }
      }
    }
    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`
    }
  }

  const envUrl = process.env.DATABASE_URL
  if (!envUrl) {
    const defaultPath = path.resolve(process.cwd(), 'prisma/db/custom.db')
    return `file:${defaultPath}`
  }
  if (envUrl.startsWith('file:')) {
    const rawPath = envUrl.replace('file:', '')
    const absolutePath = path.isAbsolute(rawPath)
      ? rawPath
      : path.resolve(process.cwd(), rawPath)
    return `file:${absolutePath}`
  }
  return envUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
import { PrismaClient } from '@prisma/client'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string {
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
/**
 * @file This file contains the Prisma client instance.
 * @exports db
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * The Prisma client instance.
 *
 * In development, a global Prisma client is used to prevent hot-reloading from creating too many connections.
 * @type {PrismaClient}
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
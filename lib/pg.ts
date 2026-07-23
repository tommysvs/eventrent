import { Pool } from 'pg'
import { getDatabaseConnectionString } from './database-url'

function getNumericEnv(name: string, fallback: number) {
  const value = process.env[name]

  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined
}

export const pgPool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: getDatabaseConnectionString(),
    max: getNumericEnv('PG_POOL_MAX', 3),
    idleTimeoutMillis: getNumericEnv('PG_IDLE_TIMEOUT_MS', 10_000),
    connectionTimeoutMillis: getNumericEnv('PG_CONNECT_TIMEOUT_MS', 10_000),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pgPool
}

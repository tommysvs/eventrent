import { Pool } from 'pg'
import { getDatabaseConnectionString } from './database-url'

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined
}

export const pgPool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: getDatabaseConnectionString(),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pgPool
}

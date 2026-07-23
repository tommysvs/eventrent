import { Pool, type PoolClient } from 'pg'
import { getDatabaseConnectionString } from './database-url'

type SqlValue = unknown

function normalizeSqlValue(value: SqlValue) {
  if (typeof value === 'bigint') {
    return value.toString()
  }

  return value
}

function buildQuery(strings: TemplateStringsArray, values: SqlValue[]) {
  let text = ''

  for (let index = 0; index < strings.length; index += 1) {
    text += strings[index]

    if (index < values.length) {
      text += `$${index + 1}`
    }
  }

  return {
    text,
    values: values.map(normalizeSqlValue),
  }
}

function createRawSqlApi(client: Pool | PoolClient) {
  return {
    async $queryRaw<T>(strings: TemplateStringsArray, ...values: SqlValue[]) {
      const query = buildQuery(strings, values)
      const result = await client.query(query.text, query.values)
      return result.rows as T
    },
    async $executeRaw(strings: TemplateStringsArray, ...values: SqlValue[]) {
      const query = buildQuery(strings, values)
      const result = await client.query(query.text, query.values)
      return result.rowCount ?? 0
    },
  }
}

async function findUserByUsername(client: Pool | PoolClient, username: string) {
  const result = await client.query(
    `
      SELECT
        u.id,
        u.username,
        u.name,
        u.password,
        u.role_id,
        r.name AS role_name
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.username = $1
      LIMIT 1
    `,
    [username],
  )

  return result.rows[0] ?? null
}

type DbUserBase = {
  id: bigint
  username: string
  name: string | null
  password: string
  roleId: bigint
}

type DbUserWithRole = DbUserBase & {
  role: {
    name: string
  }
}

function mapDbUserBase(row: Record<string, unknown> | null): DbUserBase | null {
  if (!row) {
    return null
  }

  return {
    id: BigInt(String(row.id)),
    username: String(row.username),
    name: row.name === null ? null : String(row.name),
    password: String(row.password),
    roleId: BigInt(String(row.role_id)),
  }
}

function mapDbUserWithRole(row: Record<string, unknown> | null): DbUserWithRole | null {
  const base = mapDbUserBase(row)

  if (!base) {
    return null
  }

  return {
    ...base,
    role: {
      name: String(row?.role_name ?? ''),
    },
  }
}

const globalForDb = globalThis as unknown as {
  sqlPool: Pool | undefined
}

const sqlPool =
  globalForDb.sqlPool ??
  new Pool({
    connectionString: getDatabaseConnectionString(),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.sqlPool = sqlPool
}

export const db = {
  ...createRawSqlApi(sqlPool),
  async $transaction<T>(callback: (tx: ReturnType<typeof createRawSqlApi>) => Promise<T>) {
    const client = await sqlPool.connect()

    try {
      await client.query('BEGIN')
      const tx = createRawSqlApi(client)
      const result = await callback(tx)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },
  user: {
    async findUnique(args: {
      where: { username: string }
      include?: { role?: boolean }
    }): Promise<DbUserBase | DbUserWithRole | null> {
      const row = await findUserByUsername(sqlPool, args.where.username)

      if (args.include?.role) {
        return mapDbUserWithRole(row)
      }

      return mapDbUserBase(row)
    },
    async create(args: {
      data: { username: string; name?: string | null; password: string; roleId: bigint }
      include?: { role?: boolean }
    }): Promise<DbUserBase | DbUserWithRole> {
      const inserted = await sqlPool.query(
        `
          INSERT INTO users (username, name, password, role_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id, username, name, password, role_id
        `,
        [args.data.username, args.data.name ?? null, args.data.password, args.data.roleId.toString()],
      )

      const row = inserted.rows[0]

      if (!row) {
        throw new Error('Unable to create user')
      }

      if (!args.include?.role) {
        const mapped = mapDbUserBase({ ...row, role_name: '' })

        if (!mapped) {
          throw new Error('Unable to map created user')
        }

        return mapped
      }

      const roleResult = await sqlPool.query(
        `SELECT name FROM roles WHERE id = $1 LIMIT 1`,
        [row.role_id],
      )

      const roleName = roleResult.rows[0]?.name
      const mapped = mapDbUserWithRole({ ...row, role_name: roleName })

      if (!mapped) {
        throw new Error('Unable to map created user role')
      }

      return mapped
    },
  },
  role: {
    async findUnique(args: { where: { name: string } }) {
      const result = await sqlPool.query(
        `
          SELECT id, name, description
          FROM roles
          WHERE name = $1
          LIMIT 1
        `,
        [args.where.name],
      )

      const row = result.rows[0]

      if (!row) {
        return null
      }

      return {
        id: BigInt(String(row.id)),
        name: String(row.name),
        description: row.description === null ? null : String(row.description),
      }
    },
  },
}

export type DbClient = typeof db

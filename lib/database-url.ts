const connectionStringCandidates = [
  process.env.DATABASE_URL,
  process.env.DATABASE_POSTGRES_URL,
  process.env.DATABASE_POSTGRES_URL_NON_POOLING,
]

function normalizeConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString)
    const isSupabase =
      url.hostname.endsWith('.supabase.co') ||
      url.hostname.endsWith('.supabase.com')
    const hasSslMode = url.searchParams.has('sslmode')
    const sslMode = url.searchParams.get('sslmode')
    const hasLibpqCompat = url.searchParams.get('uselibpqcompat') === 'true'

    if (isSupabase && !hasSslMode) {
      url.searchParams.set('sslmode', 'require')
    }

    if (isSupabase && (sslMode === 'require' || url.searchParams.get('sslmode') === 'require') && !hasLibpqCompat) {
      url.searchParams.set('uselibpqcompat', 'true')
    }

    return url.toString()
  } catch {
    return connectionString
  }
}

export function getDatabaseConnectionString() {
  const connectionString = connectionStringCandidates.find((value) => typeof value === 'string' && value.length > 0)

  if (!connectionString) {
    throw new Error(
      'Missing database connection string. Set DATABASE_URL locally or configure the Supabase/Vercel database variables.',
    )
  }

  return normalizeConnectionString(connectionString)
}
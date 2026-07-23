const connectionStringCandidates = [
  process.env.DATABASE_URL,
  process.env.DATABASE_POSTGRES_URL,
  process.env.DATABASE_POSTGRES_URL_NON_POOLING,
]

export function getDatabaseConnectionString() {
  const connectionString = connectionStringCandidates.find((value) => typeof value === 'string' && value.length > 0)

  if (!connectionString) {
    throw new Error(
      'Missing database connection string. Set DATABASE_URL locally or configure the Supabase/Vercel database variables.',
    )
  }

  return connectionString
}